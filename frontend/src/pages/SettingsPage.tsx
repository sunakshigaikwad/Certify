import React, { useState } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { API_URL } from '../config';
import { 
  User, 
  Lock, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Database,
  Building
} from 'lucide-react';

interface SettingsPageProps {
  user: any;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'network'>('profile');
  
  // Profile form states
  const [name, setName] = useState(user?.name || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await axios.patch(
        `${API_URL}/users/profile/update`, 
        { name, designation },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProfileSuccess('Profile updated successfully!');
      // Update local storage user profile cache
      const cachedToken = localStorage.getItem('token');
      if (cachedToken) {
        // Just triggers state update locally or profile refreshes on reload
      }
    } catch (err: any) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await axios.patch(
        `${API_URL}/users/profile/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPassSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setPassError(err.response?.data?.message || 'Failed to change password. Make sure old password is correct.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Settings" user={user} />

        <main className="p-8 max-w-4xl">
          <p className="text-xs text-gray-500 mb-6">Manage your account profile, update credentials, and check blockchain network parameters.</p>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Inner Settings Sidebar Tabs */}
            <div className="w-full md:w-60 border-r border-gray-200 bg-gray-50/50 p-4 space-y-1 shrink-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                  activeTab === 'profile' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs' 
                    : 'text-gray-650 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                  activeTab === 'security' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs' 
                    : 'text-gray-650 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Security & Password</span>
              </button>

              <button
                onClick={() => setActiveTab('network')}
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                  activeTab === 'network' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs' 
                    : 'text-gray-650 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Ledger Parameters</span>
              </button>
            </div>

            {/* Inner Tab Panels */}
            <div className="flex-1 p-6 md:p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Profile Details</h3>
                    <p className="text-xs text-gray-500 mt-1">Update your personal account information.</p>
                  </div>

                  {profileSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded p-3 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded p-3 flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="text" 
                        value={user?.email || ''} 
                        disabled 
                        className="mt-1 block w-full rounded border border-gray-250 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed" 
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Email address cannot be changed.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter full name"
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400 text-gray-800" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation / Title</label>
                      <input 
                        type="text" 
                        value={designation} 
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400 text-gray-800" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Workspace Role</label>
                      <div className="mt-1.5 flex items-center space-x-2">
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          {user?.role}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">Status: Active</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded transition-colors shadow-sm flex items-center gap-1.5 border border-emerald-800"
                    >
                      {profileLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                      <span>{profileLoading ? 'Saving...' : 'Save Profile Details'}</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Security Credentials</h3>
                    <p className="text-xs text-gray-500 mt-1">Change your password credentials to secure your workspace.</p>
                  </div>

                  {passSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded p-3 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  {passError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded p-3 flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Password</label>
                      <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400 text-gray-850" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400 text-gray-855" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400 text-gray-860" 
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passLoading}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded transition-colors shadow-sm flex items-center gap-1.5 border border-emerald-800"
                    >
                      {passLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                      <span>{passLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Ledger Configuration</h3>
                    <p className="text-xs text-gray-500 mt-1">Cryptographic smart contract registry connection properties.</p>
                  </div>

                  <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 space-y-4 max-w-xl text-sm">
                    <div className="flex items-start space-x-3">
                      <Database className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Smart Contract Registry Address</span>
                        <p className="font-mono text-xs font-bold text-gray-850 break-all mt-0.5">0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-150 pt-4 flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Active RPC Network</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="font-bold text-gray-800">Polygon Amoy Testnet</p>
                          <span className="h-2 w-2 bg-emerald-600 rounded-full animate-ping"></span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-extrabold uppercase">CONNECTED</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-150 pt-4 flex items-start space-x-3">
                      <Building className="h-5 w-5 text-emerald-800 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Default Target Organization</span>
                        <p className="font-semibold text-gray-850 mt-0.5">{user?.organization?.name || 'Default Enterprise'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
