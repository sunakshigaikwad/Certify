import React from 'react';
import { Bell, RefreshCw, User, GraduationCap } from 'lucide-react';

interface TopbarProps {
  title: string;
  user: any;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ title, user, onRefresh, isRefreshing = false }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20">
      {/* Title & Refresh */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded transition-colors duration-150 ${
              isRefreshing ? 'animate-spin text-emerald-700' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {/* Verification badge if applicable */}
        {user?.role === 'EMPLOYEE' && (
          <span className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Secure Verification Active</span>
          </span>
        )}

        {/* Notifications Icon */}
        <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Details */}
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()} Portal</p>
          </div>
        </div>
      </div>
    </header>
  );
};
