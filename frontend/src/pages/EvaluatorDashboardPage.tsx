import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Award, Check, X, Star, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface EvaluatorDashboardPageProps {
  user: any;
  onLogout: () => void;
  completedView?: boolean;
}

export const EvaluatorDashboardPage: React.FC<EvaluatorDashboardPageProps> = ({ user, onLogout, completedView = false }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal & AI evaluation state
  const [evalReq, setEvalReq] = useState<any | null>(null);
  const [aiData, setAiData] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form states matching Figure 9.16
  const [ratings, setRatings] = useState({
    technicalSkills: 4,
    communication: 3,
    teamwork: 5,
    punctuality: 3,
    leadership: 4,
    problemSolving: 4,
    overallRating: 8,
  });
  const [comments, setComments] = useState('');

  const fetchData = async () => {
    setRefreshing(true);
    try {
      if (completedView) {
        const res = await axios.get(`${API_URL}/evaluations/completed`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCompleted(res.data || []);
      } else {
        const res = await axios.get(`${API_URL}/evaluations/pending`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRequests(res.data || []);
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
  }, [completedView]);

  const handleOpenEvaluate = async (req: any) => {
    setEvalReq(req);
    setAiLoading(true);
    setAiData(null);
    try {
      // Trigger AI analysis to pre-fill evaluation
      const res = await axios.get(`http://localhost:5000/requests/${req.id}/ai-analysis`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiData(res.data);
      // Pre-fill ratings and comments from AI suggestion
      setRatings({
        technicalSkills: res.data.scores.technical,
        communication: res.data.scores.communication,
        teamwork: res.data.scores.teamwork,
        punctuality: res.data.scores.punctuality,
        leadership: res.data.scores.leadership,
        problemSolving: res.data.scores.problemSolving,
        overallRating: res.data.overallRating,
      });
      setComments(res.data.comments);
    } catch (err) {
      console.error('AI loading failed', err);
      // Fallback defaults
      setRatings({
        technicalSkills: 4,
        communication: 3,
        teamwork: 5,
        punctuality: 3,
        leadership: 4,
        problemSolving: 4,
        overallRating: 8,
      });
      setComments('');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRatingChange = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleDecision = async (approved: boolean) => {
    try {
      await axios.post(`http://localhost:5000/evaluations/${evalReq.id}`, {
        ...ratings,
        comments,
        approved,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setEvalReq(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit evaluation');
    }
  };

  const renderStars = (key: string, count: number, max = 5) => {
    const stars = [];
    for (let i = 1; i <= max; i++) {
      stars.push(
        <button
          type="button"
          key={i}
          onClick={() => handleRatingChange(key, i)}
          className={`focus:outline-none transition-colors duration-75 ${
            i <= count ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'
          }`}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} notificationCount={requests.length} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar 
          title={completedView ? "Completed Evaluations" : "Pending Evaluations"} 
          user={user} 
          onRefresh={fetchData} 
          isRefreshing={refreshing} 
        />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">
            {completedView 
              ? "List of completed evaluations and candidate reviews." 
              : "Review and rate candidate experience requests."
            }
          </p>

          <div className="emerald-card">
            <h3 className="text-base font-bold text-gray-800 mb-6">
              {completedView ? "Completed Evaluations" : "Pending Queue"}
            </h3>

            {/* List tables matching Figure 9.15 */}
            <div className="overflow-x-auto">
              {!completedView ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate info</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading pending requests...</td></tr>
                    ) : requests.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No pending requests assigned to you.</td></tr>
                    ) : (
                      requests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-gray-900">{req.employeeName}</p>
                            <p className="text-xs text-gray-500">{req.employeeEmail}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{req.skillsRequested}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{req.duration}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold whitespace-nowrap">{req.attendance}%</td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(req.updatedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleOpenEvaluate(req)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-1 px-3.5 rounded text-xs transition-colors shadow-sm"
                            >
                              Evaluate
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evaluation Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading completed evaluations...</td></tr>
                    ) : completed.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No completed evaluations found.</td></tr>
                    ) : (
                      completed.map(ev => (
                        <tr key={ev.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-gray-900">{ev.request?.employeeName}</p>
                            <p className="text-xs text-gray-500">{ev.request?.employeeEmail}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {ev.approved ? (
                              <span className="emerald-badge-success font-bold">Approved</span>
                            ) : (
                              <span className="emerald-badge-danger font-bold">Rejected</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-800">
                            {ev.overallRating}/10
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={ev.comments}>
                            {ev.comments || 'No comments'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(ev.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Evaluate Request Modal matching Figure 9.16 */}
      {evalReq && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-2 text-emerald-700">
                <Star className="h-5 w-5 fill-current text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-gray-950">Evaluate Request</h3>
                  <p className="text-xs text-gray-500">{evalReq.employeeName} • {evalReq.skillsRequested}</p>
                </div>
              </div>
              <button onClick={() => setEvalReq(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {aiLoading ? (
                <div className="py-8 text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-700" />
                  <span>AI parsing and validating skills...</span>
                </div>
              ) : (
                <>
                  {/* AI Pre-validated Skills tags row */}
                  {aiData && (
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
                        <Sparkles className="h-4 w-4 text-emerald-700" />
                        <span>AI Pre-validated Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {aiData.skillsValidated.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-0.5 rounded font-semibold flex items-center space-x-1">
                            <Check className="h-3.5 w-3.5 text-emerald-700" />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-emerald-600 font-medium">{aiData.validationMessage}</p>
                    </div>
                  )}

                  {/* Ratings Star Rows */}
                  <div className="space-y-4">
                    {[
                      { label: 'Technical Skills', key: 'technicalSkills', val: ratings.technicalSkills },
                      { label: 'Communication', key: 'communication', val: ratings.communication },
                      { label: 'Teamwork', key: 'teamwork', val: ratings.teamwork },
                      { label: 'Punctuality', key: 'punctuality', val: ratings.punctuality },
                      { label: 'Leadership', key: 'leadership', val: ratings.leadership },
                      { label: 'Problem Solving', key: 'problemSolving', val: ratings.problemSolving },
                    ].map(row => (
                      <div key={row.key} className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-700">{row.label}</span>
                        <div className="flex items-center space-x-4">
                          {renderStars(row.key, row.val)}
                          <span className="text-xs font-bold text-emerald-800 w-8 text-right">{row.val}/5</span>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                      <span className="font-bold text-gray-800">Overall Rating</span>
                      <div className="flex items-center space-x-4">
                        {renderStars('overallRating', ratings.overallRating, 10)}
                        <span className="text-sm font-extrabold text-emerald-800 w-8 text-right">{ratings.overallRating}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      className="block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none placeholder-gray-400"
                      placeholder="Optional feedback..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => handleDecision(true)}
                disabled={aiLoading}
                className="emerald-btn-primary px-6 bg-emerald-700 flex items-center space-x-1"
              >
                <Check className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleDecision(false)}
                disabled={aiLoading}
                className="emerald-btn-danger bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-none px-6 flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
