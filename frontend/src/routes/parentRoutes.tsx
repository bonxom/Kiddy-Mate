// parentRoutes.tsx
import DashboardPage from '../pages/parents/DashboardPage';
import TaskCenterPage from '../pages/parents/TaskCenterPage';
import RewardCenterPage from '../pages/parents/RewardCenterPage';
import SettingsPage from '../pages/parents/SettingsPage';
import { type ComponentType } from 'react'; 

interface ParentRoute {
  path: string;
  Component: ComponentType; 
}

export const parentRoutes: ParentRoute[] = [
  {
    path: 'dashboard',
    Component: DashboardPage, 
  },
  {
    path: 'tasks',
    Component: TaskCenterPage,
  },
  {
    path: 'rewards',
    Component: RewardCenterPage,
  },
  {
    path: 'settings',
    Component: SettingsPage,
  },
];