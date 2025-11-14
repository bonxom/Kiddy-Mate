import { Routes, Route, Navigate } from 'react-router-dom';
import ParentLayout from '../components/layout/ParentLayout';
import { parentRoutes } from './parentRoutes';
// import LoginPage from '../pages/public/LoginPage';

export const AppRouter = () => {
  // Giả sử có logic check auth ở đây
  const isParentAuthenticated = true; // Hardcode là đã đăng nhập
  const isChildAuthenticated = false;

  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />

      <Route 
        path="/parent/*" 
        element={isParentAuthenticated ? <ParentRoutes /> : <Navigate to="/login" />}
      />

      <Route 
        path="/child/*" 
        element={isChildAuthenticated ? <div>Child App</div> : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/login" />} />
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