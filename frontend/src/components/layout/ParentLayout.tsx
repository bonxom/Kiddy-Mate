import { type ReactNode } from 'react';
import Sidebar from './Sidebar';

interface ParentLayoutProps {
  children: ReactNode;
}

const ParentLayout = ({ children }: ParentLayoutProps) => {
  return (
        <div className="flex min-h-screen bg-light-bg">
      {/* Sidebar - Fixed bên trái */}
      <Sidebar />

      {/* Main Content - Chiếm toàn bộ không gian còn lại */}
      <main className="flex-1 ml-20 overflow-y-auto transition-all duration-300">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ParentLayout;
