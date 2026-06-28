import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { FolderClosed, Hourglass, Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardPageProps {
  user: any;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    verified: 0,
    total: 0,
    rejected: 0,
    pending: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      let requests: any[] = [];
      if (user.role === 'ADMIN') {
        const [incomingRes, progressRes, issuedRes] = await Promise.all([
          axios.get(`${API_URL}/requests/incoming`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`${API_URL}/requests/in-progress`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`${API_URL}/certificates`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        
        // Let's get total employee list or requests list
        // Note: we can queries all requests or combine them.
        const incoming = incomingRes.data || [];
        const inProgress = progressRes.data || [];
        const issued = issuedRes.data || [];
        
        // Let's combine
        requests = [...incoming, ...inProgress];
        
        const total = incoming.length + inProgress.length + issued.length;
        const verified = issued.length;
        const pending = incoming.length + inProgress.filter((r: any) => r.status === 'FORWARDED').length;
        const rejected = inProgress.filter((r: any) => r.status === 'REJECTED').length;

        setStats({
          verified,
          total,
          rejected,
          pending,
        });

        // Map activities
        const mapped = [...incoming, ...inProgress, ...issued].map((r: any) => ({
          id: r.id,
          employeeName: r.employeeName || r.request?.employeeName || 'Candidate',
          status: r.status || 'ISSUED',
          date: new Date(r.createdAt || r.issuedDate).toLocaleDateString(),
        })).slice(0, 5);
        setActivities(mapped);
      } else if (user.role === 'EMPLOYEE') {
        const res = await axios.get(`${API_URL}/requests/employee`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const list = res.data || [];
        const total = list.length;
        const verified = list.filter((r: any) => r.status === 'ISSUED').length;
        const rejected = list.filter((r: any) => r.status === 'REJECTED').length;
        const pending = list.filter((r: any) => r.status === 'SUBMITTED' || r.status === 'FORWARDED' || r.status === 'EVALUATED').length;

        setStats({
          verified,
          total,
          rejected,
          pending,
        });

        setActivities(list.map((r: any) => ({
          id: r.id,
          employeeName: r.employeeName,
          status: r.status,
          date: new Date(r.createdAt).toLocaleDateString(),
        })).slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="emerald-badge-info">Submitted</span>;
      case 'FORWARDED':
        return <span className="emerald-badge-warning">Forwarded</span>;
      case 'EVALUATED':
        return <span className="emerald-badge-success bg-emerald-50 text-emerald-700">Evaluated</span>;
      case 'ISSUED':
        return <span className="emerald-badge-success">Issued</span>;
      case 'REJECTED':
        return <span className="emerald-badge-danger">Rejected</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} notificationCount={stats.pending} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Dashboard" user={user} onRefresh={fetchDashboardData} isRefreshing={refreshing} />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">Welcome back, {user?.name}!</p>

          {/* Stats Cards Row matching Figure 9.9 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Verified Requests', val: stats.verified, icon: Award, color: 'text-emerald-700 border-emerald-500 bg-emerald-50/20' },
              { label: 'Total Requests', val: stats.total, icon: FolderClosed, color: 'text-blue-700 border-blue-500 bg-blue-50/20' },
              { label: 'Total Reject', val: stats.rejected, icon: AlertTriangle, color: 'text-red-700 border-red-500 bg-red-50/20' },
              { label: 'Pending Reviews', val: stats.pending, icon: Hourglass, color: 'text-yellow-700 border-yellow-500 bg-yellow-50/20' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`bg-white border rounded shadow-sm p-6 border-l-4 ${stat.color.split(' ')[1]}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stat.val}</p>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color.split(' ')[0]}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity Table matching Figure 9.9 */}
          <div className="emerald-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-800">Recent Activity</h3>
              {user.role === 'ADMIN' && (
                <Link to="/incoming-requests" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1">
                  <span>View incoming</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading activities...
                      </td>
                    </tr>
                  ) : activities.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No activity found.
                      </td>
                    </tr>
                  ) : (
                    activities.map((act) => (
                      <tr key={act.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {act.employeeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getStatusBadge(act.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {act.date}
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
