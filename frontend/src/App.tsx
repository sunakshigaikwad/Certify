import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { IncomingRequestsPage } from './pages/IncomingRequestsPage';
import { InProgressPage } from './pages/InProgressPage';
import { CertificatesIssuedPage } from './pages/CertificatesIssuedPage';
import { EvaluatorDashboardPage } from './pages/EvaluatorDashboardPage';
import { EmployeeRequestPage } from './pages/EmployeeRequestPage';
import { EmployeeTrackPage } from './pages/EmployeeTrackPage';
import { PublicVerificationPage } from './pages/PublicVerificationPage';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Profile fetch failed', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLoginSuccess = (authToken: string, loggedInUser: any) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm font-medium text-emerald-700 animate-pulse">Loading CertifyPro...</div>
      </div>
    );
  }

  // Component to restrict access to specific roles
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to correct default dashboard
      return <Navigate to={user.role === 'EVALUATOR' ? '/evaluator-dashboard' : '/dashboard'} replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterPage onRegisterSuccess={handleLoginSuccess} />} />
        <Route path="/verify" element={<PublicVerificationPage />} />
        <Route path="/verify/:certificateId" element={<PublicVerificationPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <DashboardPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/manage-users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageUsersPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/incoming-requests" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <IncomingRequestsPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/in-progress" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <InProgressPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/certificates-issued" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <CertificatesIssuedPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/evaluator-dashboard" element={
          <ProtectedRoute allowedRoles={['EVALUATOR']}>
            <EvaluatorDashboardPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/evaluator-completed" element={
          <ProtectedRoute allowedRoles={['EVALUATOR']}>
            <EvaluatorDashboardPage user={user} onLogout={handleLogout} completedView={true} />
          </ProtectedRoute>
        } />

        <Route path="/employee-request" element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeRequestPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/employee-track" element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeTrackPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
