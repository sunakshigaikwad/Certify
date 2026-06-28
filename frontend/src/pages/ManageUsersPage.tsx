import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Trash2, Edit, CheckCircle, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ManageUsersPageProps {
  user: any;
  onLogout: () => void;
}

export const ManageUsersPage: React.FC<ManageUsersPageProps> = ({ user, onLogout }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchEvaluators = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/users/evaluators`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvaluators(res.data || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to load team members.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const onSubmit = async (data: any) => {
    setErrorMsg(null);
    setCreatedUser(null);
    try {
      const res = await axios.post(`${API_URL}/users/evaluators`, {
        name: data.name,
        email: data.email,
        designation: data.designation,
        role: data.role,
        password: data.password,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Display green box with credentials
      setCreatedUser({
        email: data.email,
        password: data.password,
        role: data.role,
      });

      reset();
      fetchEvaluators();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create evaluator.');
    }
  };

  const handleDelete = async (evalId: string) => {
    if (!window.confirm('Are you sure you want to delete this evaluator?')) return;
    try {
      await axios.delete(`http://localhost:5000/users/${evalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvaluators();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (evalId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await axios.patch(`http://localhost:5000/users/${evalId}/status`, {
        status: nextStatus,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvaluators();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Manage Users" user={user} onRefresh={fetchEvaluators} isRefreshing={refreshing} />

        <main className="p-8 max-w-5xl">
          <p className="text-xs text-gray-500 mb-6">Add evaluation team members and view status.</p>

          {/* User Created Alert Box matching Figure 9.11 */}
          {createdUser && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded p-4 text-emerald-800">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">User Created!</h4>
                  <div className="mt-2 text-xs font-mono space-y-1">
                    <p>📧 Email: {createdUser.email}</p>
                    <p>🔑 Password: {createdUser.password}</p>
                    <p>💼 Role: {createdUser.role}</p>
                  </div>
                  <p className="mt-2 text-[11px] text-emerald-600">Please communicate these details to the team member.</p>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded p-4 text-red-800 flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Card: Add Evaluator matching Figure 9.10 */}
          <div className="emerald-card mb-8">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>+ Add Evaluator</span>
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                  placeholder="e.g. Sarah Connor"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message as string}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                  placeholder="name@company.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message as string}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Designation</label>
                <input
                  type="text"
                  {...register('designation', { required: 'Designation is required' })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                  placeholder="e.g. Team Manager"
                />
                {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation.message as string}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none bg-white"
                >
                  <option value="Team Manager [for evaluators]">Team Manager [for evaluators]</option>
                  <option value="HR">HR</option>
                  <option value="HR Manager">HR Manager</option>
                </select>
                {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message as string}</p>}
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Temporary Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min length 6' } })}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message as string}</p>}
              </div>

              <div className="md:col-span-2 flex justify-start">
                <button type="submit" className="emerald-btn-primary py-2.5 px-6">
                  Add User
                </button>
              </div>
            </form>
          </div>

          {/* Team Members List Card matching Figure 9.10 */}
          <div className="emerald-card">
            <h3 className="text-base font-bold text-gray-800 mb-6">Team Members</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading team members...
                      </td>
                    </tr>
                  ) : evaluators.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No team members registered yet.
                      </td>
                    </tr>
                  ) : (
                    evaluators.map((evalUser) => (
                      <tr key={evalUser.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {evalUser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {evalUser.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium">
                            {evalUser.designation || 'Team Manager'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleToggleStatus(evalUser.id, evalUser.status)}
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              evalUser.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            {evalUser.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-3">
                          <button 
                            onClick={() => handleToggleStatus(evalUser.id, evalUser.status)}
                            className="text-gray-400 hover:text-emerald-700" 
                            title="Toggle status"
                          >
                            <Edit className="h-4 w-4 inline" />
                          </button>
                          <button 
                            onClick={() => handleDelete(evalUser.id)}
                            className="text-gray-400 hover:text-red-700"
                            title="Delete evaluator"
                          >
                            <Trash2 className="h-4 w-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
