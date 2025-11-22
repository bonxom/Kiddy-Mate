import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Component để load và render 3D model
const Model = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/robot_playground.glb');
  const { actions } = useAnimations(animations, group);
  const [isVisible, setIsVisible] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetRotation = useRef({ y: 0, x: 0 });
  const currentRotation = useRef({ y: 0, x: 0 });
  
  // Auto-scale model to optimal size and center it
  useEffect(() => {
    if (scene && group.current) {
      // Calculate bounding box to get model dimensions
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Calculate scale factor to make model fill viewport nicely
      const maxDim = Math.max(size.x, size.y, size.z);
      const desiredSize = 3.5; // Target size (larger = bigger model)
      const scale = desiredSize / maxDim;
      
      // Apply scale
      group.current.scale.setScalar(scale);
      
      // Center the model
      group.current.position.x = -center.x * scale;
      group.current.position.y = -center.y * scale;
      group.current.position.z = -center.z * scale;

      // Calculate rotation to face the camera
      // Camera is at position [3, 2, 4], so robot should face towards that direction
      // The direction vector from robot (origin) to camera is [3, 2, 4]
      // In XZ plane, this is [3, 4], so angle = atan2(3, 4) ≈ 0.6435 radians
      const cameraX = 3;
      const cameraZ = 4;
      let angleToCamera = Math.atan2(cameraX, cameraZ);
      
      // Bot nhìn thẳng về phía người dùng ban đầu
      // If the model's front faces -Z by default (common in 3D models),
      // we need to add Math.PI (180°) to face +Z direction where camera is
      // Try: angleToCamera + Math.PI to face camera
      // If that's wrong, try: angleToCamera (without PI) or angleToCamera - Math.PI/2
      angleToCamera += Math.PI / 4; // Flip 180° to face camera (adjust if needed)
      
      // Set initial rotation (will be overridden by useFrame animation)
      const baseRotationY = angleToCamera;
      const baseRotationX = Math.PI / 33;
      
      group.current.rotation.y = baseRotationY; // Face towards camera position
      group.current.rotation.x = baseRotationX; // Slight tilt for better view
      group.current.rotation.z = Math.PI / 50; // Minimal Z rotation
      
      // Initialize rotation refs for smooth mouse tracking
      targetRotation.current.y = baseRotationY;
      targetRotation.current.x = baseRotationX;
      currentRotation.current.y = baseRotationY;
      currentRotation.current.x = baseRotationX;
      
      // Force update to ensure rotation is applied immediately
      group.current.updateMatrixWorld(true);
      
      // Optimize materials and meshes
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          child.frustumCulled = true;
          
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene]);

  // Auto-play animation 'experiment' with infinite loop
  useEffect(() => {
    if (actions && actions['experiment']) {
      const action = actions['experiment'];
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }
  }, [actions]);

  // Pause animation when component is not visible (performance optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Pause/resume animation based on visibility
  useEffect(() => {
    if (actions && actions['experiment']) {
      if (isVisible) {
        actions['experiment'].paused = false;
      } else {
        actions['experiment'].paused = true;
      }
    }
  }, [isVisible, actions]);

  // Mouse tracking for interactive rotation
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range based on viewport
      const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;
      
      setMousePosition({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate base rotation values (memoized)
  const baseAngle = useRef<number>(0);
  const baseRotationX = useRef<number>(0);
  
  // Initialize base rotation values
  useEffect(() => {
    const cameraX = 3;
    const cameraZ = 4;
    let angle = Math.atan2(cameraX, cameraZ);
    angle += Math.PI / 4; // Adjust based on model orientation
    baseAngle.current = angle;
    baseRotationX.current = Math.PI / 33;
  }, []);

  // Update target rotation based on mouse position
  useEffect(() => {
    // Calculate mouse influence (biên độ nhỏ)
    const maxRotationY = Math.PI / 6; // ±30 degrees max rotation on Y axis
    const maxRotationX = Math.PI / 12; // ±15 degrees max rotation on X axis

    // Target rotation based on mouse position
    targetRotation.current.y = baseAngle.current + (mousePosition.x * maxRotationY);
    targetRotation.current.x = baseRotationX.current + (mousePosition.y * maxRotationX);
  }, [mousePosition]);

  // Smooth rotation animation using useFrame hook
  useFrame(() => {
    if (!group.current) return;

    // Smooth interpolation (lerp) với factor 0.1 để tạo chuyển động mượt
    const lerpFactor = 0.1;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpFactor;
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpFactor;

    // Apply rotation
    group.current.rotation.y = currentRotation.current.y;
    group.current.rotation.x = currentRotation.current.x;
  });

  return <primitive ref={group} object={scene} />;
};

// Preload the model
useGLTF.preload('/robot_playground.glb');

const RobotCanvas = () => {
  return (
    <div className="w-full h-full min-h-full overflow-visible">
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ 
          position: [3, 2, 4], // Closer position for larger initial view
          fov: 45.5, // Wider FOV for better perspective
          near: 0.1,
          far: 1000,
        }}
        className="w-full h-full"
        style={{ 
          minHeight: '100%',
          minWidth: '100%',
        }}
        gl={{ 
          antialias: true,
          alpha: true, // Enable alpha channel for transparency
          premultipliedAlpha: false, // Better transparency handling
          powerPreference: 'high-performance',
        }}
        performance={{ 
          min: 0.5,
        }}
        frameloop="always"
        onCreated={({ gl, camera }) => {
          // Set clear color to fully transparent
          gl.setClearColor(0x000000, 0);
          // Enable proper blending for transparency
          gl.sortObjects = true;
          
          // Optimize camera for model viewing
          camera.lookAt(0, 0, 0);
        }}
      >
        {/* Enhanced lighting for transparent background */}
        <ambientLight intensity={0.8} />
        
        {/* Main directional light */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.0}
        />
        
        {/* Fill light from opposite side */}
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.4}
        />
        
        {/* Top light for better definition */}
        <directionalLight
          position={[0, 10, 0]}
          intensity={0.3}
        />

        {/* Orbit Controls - chỉ cho phép xoay, không zoom */}
        {/* Orbit Controls - chỉ cho phép xoay, không zoom */}
        <OrbitControls
          enableZoom={false} // Tắt zoom
          enablePan={false}
          enableRotate={true} // Cho phép xoay bằng chuột
          enableDamping={true}
          dampingFactor={0.08}
          autoRotate={false}
          target={[0, 0, 0]}
          minPolarAngle={Math.PI / 3} // Giới hạn góc xoay dọc
          maxPolarAngle={Math.PI / 1.5}
          enableZoom={false} // Tắt zoom
          enablePan={false}
          enableRotate={true} // Cho phép xoay bằng chuột
          enableDamping={true}
          dampingFactor={0.08}
          autoRotate={false}
          target={[0, 0, 0]}
          minPolarAngle={Math.PI / 3} // Giới hạn góc xoay dọc
          maxPolarAngle={Math.PI / 1.5}
        />

        {/* Suspense wrapper cho model với fallback */}
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RobotCanvas;
