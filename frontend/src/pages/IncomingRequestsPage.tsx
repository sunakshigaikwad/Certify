import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { FolderClosed, CheckSquare, X, AlertTriangle, BookOpen } from 'lucide-react';

interface IncomingRequestsPageProps {
  user: any;
  onLogout: () => void;
}

export const IncomingRequestsPage: React.FC<IncomingRequestsPageProps> = ({ user, onLogout }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [modalSkills, setModalSkills] = useState('');
  const [modalDuration, setModalDuration] = useState('');
  const [modalAttendance, setModalAttendance] = useState(0);
  const [selectedEvalId, setSelectedEvalId] = useState('');

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [reqsRes, evalsRes] = await Promise.all([
        axios.get(`${API_URL}/requests/incoming`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/users/evaluators`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setRequests(reqsRes.data || []);
      const evalList = evalsRes.data || [];
      setEvaluators(evalList);
      if (evalList.length > 0) {
        setSelectedEvalId(evalList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenForwardModal = (req: any) => {
    setSelectedReq(req);
    setModalSkills(req.skillsRequested);
    setModalDuration(req.duration);
    setModalAttendance(req.attendance);
  };

  const handleForwardSubmit = async () => {
    if (!selectedEvalId) {
      alert('Please select an evaluator before forwarding.');
      return;
    }
    
    try {
      const selectedEval = evaluators.find(e => e.id === selectedEvalId);
      await axios.patch(`${API_URL}/requests/${selectedReq.id}/forward`, {
        skills: modalSkills,
        duration: modalDuration,
        attendance: modalAttendance,
        evaluatorId: selectedEvalId,
        evaluatorRole: selectedEval ? selectedEval.designation : 'Team Manager',
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSelectedReq(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to forward request');
    }
  };

  const handleReject = async (reqId: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await axios.patch(`${API_URL}/requests/${reqId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} notificationCount={requests.length} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Incoming Requests" user={user} onRefresh={fetchData} isRefreshing={refreshing} />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">Review candidate certificate requests. Forward them to evaluators.</p>

          <div className="space-y-6 max-w-4xl">
            {loading ? (
              <div className="text-sm text-gray-500">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="emerald-card text-center py-12 text-sm text-gray-500">
                No incoming certificate requests found.
              </div>
            ) : (
              requests.map((req) => (
                /* Employee Card matching Figure 9.12 */
                <div key={req.id} className="bg-amber-50/20 border border-amber-200/60 rounded p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{req.employeeName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{req.employeeEmail}</p>

                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-gray-500">Skills:</span>{' '}
                        <span className="text-gray-900">{req.skillsRequested}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500">Attendance:</span>{' '}
                        <span className="text-gray-900">{req.attendance}%</span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="font-semibold text-gray-500">Duration:</span>{' '}
                        <span className="text-gray-900">{req.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                    <button 
                      onClick={() => handleOpenForwardModal(req)}
                      className="emerald-btn-primary px-4 py-2"
                    >
                      Forward to Evaluators
                    </button>
                    <button 
                      onClick={() => handleReject(req.id)}
                      className="emerald-btn-danger bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-none px-4 py-2"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Forward to Evaluators Popup Modal matching Figure 9.13 */}
      {selectedReq && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-2 text-emerald-700">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-base font-bold">Forward to Evaluators</h3>
              </div>
              <button 
                onClick={() => setSelectedReq(null)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded px-4 py-2 text-sm text-emerald-800 font-medium">
                {selectedReq.employeeName} has requested a certificate.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills (confirm or update)</label>
                <input
                  type="text"
                  value={modalSkills}
                  onChange={(e) => setModalSkills(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    value={modalDuration}
                    onChange={(e) => setModalDuration(e.target.value)}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance %</label>
                  <input
                    type="number"
                    value={modalAttendance}
                    onChange={(e) => setModalAttendance(Number(e.target.value))}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Evaluator Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign Evaluator</label>
                <select
                  value={selectedEvalId}
                  onChange={(e) => setSelectedEvalId(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none bg-white"
                >
                  {evaluators.length === 0 ? (
                    <option value="">No Evaluators Available</option>
                  ) : (
                    evaluators.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.designation || 'Team Manager'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Info text alert matching Figure 9.13 */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded p-3 text-xs text-gray-600 flex items-start space-x-2">
                <CheckSquare className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                <span>Auto flow: Team Manager → HR → HR Manager (based on your team)</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                onClick={handleForwardSubmit}
                className="emerald-btn-primary px-6"
              >
                Forward
              </button>
              <button 
                onClick={() => setSelectedReq(null)}
                className="emerald-btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
