import { NavLink } from 'react-router-dom';
import {
  Aperture,
  LayoutDashboard,
  ListTodo,
  Award,
  Settings,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      to: '/parent/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/parent/tasks',
      icon: ListTodo,
      label: 'Task Center',
    },
    {
      to: '/parent/rewards',
      icon: Award,
      label: 'Reward Center',
    },
    {
      to: '/parent/settings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-primary flex flex-col items-center py-6 shadow-lg z-50">
      {/* Logo */}
      <div className="mb-8">
        <Aperture className="w-10 h-10 text-white" strokeWidth={2} />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center justify-center w-full h-14 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                  isActive ? 'bg-white/10' : ''
                }`
              }
            >
              <Icon
                className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
                strokeWidth={2}
              />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                {item.label}
                {/* Arrow */}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        className="group relative flex items-center justify-center w-full h-14 rounded-lg transition-all duration-200 hover:bg-white/10 px-3"
        onClick={() => {
          // TODO: Implement logout logic
          console.log('Logout clicked');
        }}
      >
        <LogOut
          className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
          strokeWidth={2}
        />
        
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
          Log out
          {/* Arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
        </span>
      </button>
    </aside>
  );
};

export default Sidebar;
