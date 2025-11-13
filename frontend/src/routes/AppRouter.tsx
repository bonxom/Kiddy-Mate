import { Routes, Route, Navigate } from 'react-router-dom';
import ParentLayout from '../components/layout/ParentLayout';
import DashboardPage from '../pages/parents/DashboardPage';
// import LoginPage from '../pages/public/LoginPage';

// Temporary placeholder components
const TaskCenterPage = () => <div>Task Center Page</div>;
const RewardCenterPage = () => <div>Reward Center Page</div>;
const SettingsPage = () => <div>Settings Page</div>;

export const AppRouter = () => {
  // Giả sử chúng ta có logic check auth ở đây
  const isParentAuthenticated = true; // Hardcode là đã đăng nhập
  const isChildAuthenticated = false;

  return (
    <Routes>
      {/* Luồng Public */}
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />

      {/* Luồng Parent (Phụ huynh) */}
      <Route 
        path="/parent/*" 
        element={isParentAuthenticated ? <ParentRoutes /> : <Navigate to="/login" />}
      />

      {/* Luồng Child (Trẻ em) */}
      <Route 
        path="/child/*" 
        element={isChildAuthenticated ? <div>Child App</div> : <Navigate to="/login" />}
      />

      {/* Route mặc định */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Một component con để quản lý các route của Parent
const ParentRoutes = () => {
  return (
    <ParentLayout>
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TaskCenterPage />} />
        <Route path="rewards" element={<RewardCenterPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="dashboard" />} />
      </Routes>
    </ParentLayout>
  );
};