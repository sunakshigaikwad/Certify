import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileDown, 
  Hourglass, 
  Award, 
  Settings, 
  LogOut,
  FolderClosed,
  PlusCircle,
  SearchCheck,
  Building,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
  notificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, notificationCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/manage-users', label: 'Manage Users', icon: Users },
          { 
            to: '/incoming-requests', 
            label: 'Incoming Requests', 
            icon: FolderClosed,
            badge: notificationCount > 0 ? notificationCount : undefined 
          },
          { to: '/in-progress', label: 'In Progress', icon: Hourglass },
          { to: '/certificates-issued', label: 'Certificates Issued', icon: Award },
          { to: '/verify', label: 'Verification', icon: SearchCheck },
          { to: '/settings', label: 'Settings', icon: Settings },
        ];
      case 'EVALUATOR':
        return [
          { to: '/evaluator-dashboard', label: 'Pending', icon: Hourglass, badge: notificationCount > 0 ? notificationCount : undefined },
          { to: '/evaluator-completed', label: 'Completed', icon: Award },
          { to: '/verify', label: 'Verification', icon: SearchCheck },
          { to: '/settings', label: 'Settings', icon: Settings },
        ];
      case 'EMPLOYEE':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/employee-request', label: 'Submit Request', icon: PlusCircle },
          { to: '/employee-track', label: 'Track Status', icon: Hourglass },
          { to: '/certificates-issued', label: 'Certificates Issued', icon: Award },
          { to: '/verify', label: 'Verification', icon: SearchCheck },
          { to: '/settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed top-0 bottom-0 left-0 z-30">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center space-x-2 text-emerald-700">
          <GraduationCap className="h-8 w-8" />
          <span className="text-xl font-bold font-sans">CertifyPro</span>
        </div>
      </div>

      {/* User Info profile summary below brand */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Enterprise Portal</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{user?.organization?.name || 'Google Software Pvt Ltd'}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.name} ({user?.role === 'ADMIN' ? 'HR Admin' : user?.designation || user?.role})</p>
      </div>

      {/* Menu links list */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-colors duration-150 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-700 pl-2' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
