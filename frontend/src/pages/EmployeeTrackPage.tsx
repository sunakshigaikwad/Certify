import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Eye, Download, Info, Award, CheckCircle, Hourglass, XCircle, RefreshCw } from 'lucide-react';

interface EmployeeTrackPageProps {
  user: any;
  onLogout: () => void;
}

export const EmployeeTrackPage: React.FC<EmployeeTrackPageProps> = ({ user, onLogout }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchRequests = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/requests/employee`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenAiReport = async (req: any) => {
    setSelectedReq(req);
    setAiLoading(true);
    setAiReport(null);
    try {
      const res = await axios.get(`${API_URL}/requests/${req.id}/ai-analysis`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiReport(res.data);
    } catch (err) {
      console.error('Error fetching AI analysis', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownload = (pdfPath: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${pdfPath}`;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Hourglass className="h-5 w-5 text-blue-500" />;
      case 'FORWARDED':
        return <Hourglass className="h-5 w-5 text-yellow-500" />;
      case 'EVALUATED':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'ISSUED':
        return <Award className="h-5 w-5 text-emerald-700" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="emerald-badge-info bg-blue-50 text-blue-800">Submitted</span>;
      case 'FORWARDED':
        return <span className="emerald-badge-warning bg-yellow-50 text-yellow-800">In Evaluation</span>;
      case 'EVALUATED':
        return <span className="emerald-badge-success bg-emerald-50 text-emerald-800">Approved, Pending Issue</span>;
      case 'ISSUED':
        return <span className="emerald-badge-success bg-emerald-100 text-emerald-900 font-bold border-emerald-300">✓ Certificate Issued</span>;
      case 'REJECTED':
        return <span className="emerald-badge-danger bg-red-50 text-red-800">Rejected</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Track Status" user={user} onRefresh={fetchRequests} isRefreshing={refreshing} />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">Track your experience certificate requests and view AI generated report details.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request List Column */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="emerald-card text-center py-12 text-sm text-gray-500">
                  No requests submitted yet.
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-white border border-gray-200 rounded p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1 shrink-0">{getStatusIcon(req.status)}</div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-sm text-gray-800">Tenure: {req.duration}</span>
                          {getStatusText(req.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Requested Skills: {req.skillsRequested}</p>
                        <p className="text-xs text-gray-500">Attendance recorded: {req.attendance}%</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleOpenAiReport(req)}
                        className="emerald-btn-secondary px-3 py-1.5 flex items-center space-x-1"
                      >
                        <Info className="h-4 w-4" />
                        <span>AI Report</span>
                      </button>
                      
                      {req.status === 'ISSUED' && req.certificate && (
                        <button
                          onClick={() => handleDownload(req.certificate.pdfPath, `${req.certificate.certificateId}.pdf`)}
                          className="emerald-btn-primary px-3 py-1.5 bg-emerald-700 flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Report Card Panel */}
            <div className="lg:col-span-1">
              <div className="emerald-card sticky top-24">
                <h3 className="text-base font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center space-x-2">
                  <Award className="h-5 w-5 text-emerald-700" />
                  <span>AI Pre-validation Report</span>
                </h3>

                {selectedReq ? (
                  aiLoading ? (
                    <div className="py-12 text-center text-sm text-gray-500 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-emerald-700" />
                      <span>Generating report details...</span>
                    </div>
                  ) : aiReport ? (
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</span>
                        <p className="font-semibold text-gray-900 mt-0.5">{selectedReq.employeeName}</p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Skill Validation</span>
                        <div className="bg-emerald-50 border border-emerald-100 rounded px-3 py-1.5 text-xs text-emerald-800 font-bold mt-1">
                          ✓ Skills pre-validated successfully
                        </div>
                      </div>

                      {/* Strengths list */}
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Strengths Detected</span>
                        <ul className="list-disc pl-4 text-xs text-gray-600 mt-1 space-y-1">
                          {aiReport.strengths.map((str: string, idx: number) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses list */}
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Weaknesses / Gaps</span>
                        <ul className="list-disc pl-4 text-xs text-gray-600 mt-1 space-y-1">
                          {aiReport.weaknesses.map((wk: string, idx: number) => (
                            <li key={idx}>{wk}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Comments Summary</span>
                        <p className="text-xs text-gray-600 italic bg-gray-50 border border-gray-100 p-2.5 rounded mt-1 leading-relaxed">
                          "{aiReport.comments}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-6 text-center">Failed to load AI details.</p>
                  )
                ) : (
                  <p className="text-xs text-gray-500 py-12 text-center leading-relaxed">
                    Select a request from your list and click <strong className="text-gray-700">"AI Report"</strong> to load the pre-validated skill metrics here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
