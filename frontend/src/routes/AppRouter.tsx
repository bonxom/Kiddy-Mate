import { Routes, Route, Navigate } from 'react-router-dom';
import ParentLayout from '../components/layout/ParentLayout';
import { parentRoutes } from './parentRoutes';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import OnboardingPage from '../pages/public/OnboardingPage';

export const AppRouter = () => {
  // Giả sử có logic check auth ở đây
  const isParentAuthenticated = true; // Hardcode là đã đăng nhập
  const isChildAuthenticated = false;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Parent Routes */}
      <Route 
        path="/parent/*" 
        element={isParentAuthenticated ? <ParentRoutes /> : <Navigate to="/login" />}
      />

      {/* Child Routes */}
      <Route 
        path="/child/*" 
        element={isChildAuthenticated ? <div>Child App</div> : <Navigate to="/login" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Component con quản lý route của Parent
const ParentRoutes = () => {
  return (
    <ParentLayout>
      <Routes>
        {parentRoutes.map((route) => (
          <Route 
            key={route.path} 
            path={route.path} 
            element={<route.Component />}
          />
        ))}
        <Route path="*" element={<Navigate to="dashboard" />} />
      </Routes>
    </ParentLayout>
  );
};