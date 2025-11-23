import { lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import RouteSuspense from '../components/common/RouteSuspense';
import { ChildProvider } from '../providers/ChildProvider';
import Sidebar from '../components/layout/Sidebar';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const AuthPage = lazy(() => import('../pages/public/AuthPage'));
const OnboardingPage = lazy(() => import('../pages/public/OnboardingPage'));

// Parent pages - lazy loaded
const DashboardPage = lazy(() => import('../pages/parents/DashboardPage'));
const TaskCenterPage = lazy(() => import('../pages/parents/TaskCenterPage'));
const RewardCenterPage = lazy(() => import('../pages/parents/RewardCenterPage'));
const SettingsPage = lazy(() => import('../pages/parents/SettingsPage'));

// Child pages - lazy loaded
const ChildHomePage = lazy(() => import('../pages/children/ChildHomePage'));

// Parent Layout with ChildProvider and Sidebar
const ParentLayout = () => (
  <ChildProvider>
    <div className="flex min-h-screen bg-light-bg">
      <Sidebar />
      <main className="flex-1 ml-20 overflow-y-auto transition-all duration-300">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  </ChildProvider>
);

export const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();
  const isParentAuthenticated = isAuthenticated && user?.role === 'parent';
  const isChildAuthenticated = isAuthenticated && user?.role === 'child';

  return (
    <Routes>
      {/* Public Routes - Wrapped in Suspense */}
      <Route path="/" element={<RouteSuspense><LandingPage /></RouteSuspense>} />
      <Route path="/login" element={<RouteSuspense><AuthPage /></RouteSuspense>} />
      <Route path="/register" element={<RouteSuspense><AuthPage /></RouteSuspense>} />
      <Route path="/child/login" element={<RouteSuspense><AuthPage /></RouteSuspense>} />
      <Route path="/onboarding" element={<RouteSuspense><OnboardingPage /></RouteSuspense>} />

      {/* Parent Routes - Protected & Lazy Loaded */}
      {isParentAuthenticated && (
        <Route path="/parent" element={<ParentLayout />}>
          <Route path="dashboard" element={<RouteSuspense><DashboardPage /></RouteSuspense>} />
          <Route path="tasks" element={<RouteSuspense><TaskCenterPage /></RouteSuspense>} />
          <Route path="rewards" element={<RouteSuspense><RewardCenterPage /></RouteSuspense>} />
          <Route path="settings" element={<RouteSuspense><SettingsPage /></RouteSuspense>} />
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
        </Route>
      )}

      {/* Child Routes - Protected & Lazy Loaded */}
      {isChildAuthenticated && (
        <Route path="/child" element={<ParentLayout />}>
          <Route path="home" element={<RouteSuspense><ChildHomePage /></RouteSuspense>} />
          <Route index element={<Navigate to="/child/home" replace />} />
        </Route>
      )}

      {/* Redirect logic - only redirect authenticated users */}
      <Route
        path="*"
        element={
          isParentAuthenticated
            ? <Navigate to="/parent/dashboard" replace />
            : isChildAuthenticated
              ? <Navigate to="/child/home" replace />
              : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
};

export default AppRouter;