import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Component để load và render 3D model
const Model = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/robot_playground.glb');
  const { actions } = useAnimations(animations, group);
  const [isVisible, setIsVisible] = useState(true);
  
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

      // Bot nhìn thẳng về phía người dùng ban đầu
      group.current.rotation.y = Math.PI / 2.5; // Quay mặt về phía camera
      group.current.rotation.x = Math.PI / 33;
      group.current.rotation.z = Math.PI / 50;
      
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
        frameloop="demand"
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
