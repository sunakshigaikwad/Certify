import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: (token: string, user: any) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post('http://localhost:5000/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: activeTab,
        organizationName: activeTab === 'ADMIN' ? data.organizationName : undefined,
        designation: activeTab === 'EMPLOYEE' ? data.designation : undefined,
      });

      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        onRegisterSuccess(res.data.access_token, res.data.user);
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center space-x-2 text-emerald-700">
          <GraduationCap className="h-10 w-10" />
          <span className="text-3xl font-bold tracking-tight">CertifyPro</span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Register a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            sign in to existing profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {/* Tab selector */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('EMPLOYEE'); setErrorMsg(null); }}
              className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors duration-150 ${
                activeTab === 'EMPLOYEE' 
                  ? 'border-emerald-700 text-emerald-700 bg-emerald-50/10' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Employee Registration
            </button>
            <button
              onClick={() => { setActiveTab('ADMIN'); setErrorMsg(null); }}
              className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors duration-150 ${
                activeTab === 'ADMIN' 
                  ? 'border-emerald-700 text-emerald-700 bg-emerald-50/10' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Organization Registration
            </button>
          </div>

          <div className="py-8 px-4 sm:px-10">
            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-3 text-sm flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                    placeholder="e.g. Aksha Dhiwar"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                    placeholder="name@company.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message as string}</p>
                  )}
                </div>
              </div>

              {activeTab === 'ADMIN' ? (
                <div>
                  <label htmlFor="organizationName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Organization Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="organizationName"
                      type="text"
                      {...register('organizationName', { required: 'Organization name is required' })}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                      placeholder="e.g. Google Software Pvt Ltd"
                    />
                    {errors.organizationName && (
                      <p className="mt-1 text-xs text-red-600">{errors.organizationName.message as string}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="designation" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Current Designation
                  </label>
                  <div className="mt-1">
                    <input
                      id="designation"
                      type="text"
                      {...register('designation', { required: 'Designation is required' })}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                      placeholder="e.g. Software Engineer"
                    />
                    {errors.designation && (
                      <p className="mt-1 text-xs text-red-600">{errors.designation.message as string}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none transition-colors duration-150 shadow-sm"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
