import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';

interface InProgressPageProps {
  user: any;
  onLogout: () => void;
}

export const InProgressPage: React.FC<InProgressPageProps> = ({ user, onLogout }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [confirmReq, setConfirmReq] = useState<any | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [issuedCert, setIssuedCert] = useState<any | null>(null);

  const fetchInProgress = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get('http://localhost:5000/requests/in-progress', {
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
    fetchInProgress();
  }, []);

  const handleOpenConfirm = (req: any) => {
    setConfirmReq(req);
    setIssuedCert(null);
  };

  const handleGenerateCertificate = async () => {
    setIssuing(true);
    try {
      const res = await axios.post(`http://localhost:5000/certificates/issue/${confirmReq.id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setIssuedCert(res.data);
      fetchInProgress();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue certificate');
      setConfirmReq(null);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="In Progress" user={user} onRefresh={fetchInProgress} isRefreshing={refreshing} />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">Manage active evaluations. Generate certificates once status is "Ready".</p>

          {/* Table matching Figure 9.14 */}
          <div className="emerald-card">
            <h3 className="text-base font-bold text-gray-800 mb-6">Requests List</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading active requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No active evaluations in progress.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-900">{req.employeeName}</p>
                          <p className="text-xs text-gray-500">{req.employeeEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={req.skillsRequested}>
                          {req.skillsRequested}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {req.attendance}% Attd / {req.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {req.status === 'EVALUATED' ? (
                            <span className="emerald-badge-success bg-emerald-50 text-emerald-700 font-bold">✓ Ready</span>
                          ) : (
                            <span className="emerald-badge-info bg-blue-50 text-blue-700 font-bold">◷ Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(req.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {req.status === 'EVALUATED' ? (
                            <button
                              onClick={() => handleOpenConfirm(req)}
                              className="emerald-btn-primary py-1 px-3 bg-emerald-600 border-emerald-700"
                            >
                              Generate Certificate
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Evaluating by {req.evaluatorRole || 'Manager'}</span>
                          )}
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

      {/* Generate Certificate Popup Modal */}
      {confirmReq && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-800">Generate Certificate Confirmation</h3>
              <button 
                onClick={() => setConfirmReq(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!issuedCert ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to generate the experience certificate and email it to{' '}
                    <strong className="text-gray-900">{confirmReq.employeeName}</strong> ({confirmReq.employeeEmail})?
                  </p>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded p-3 text-xs text-gray-600">
                    This action will anchor the document cryptographic SHA-256 hash on the blockchain and dispatch a signed PDF.
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">Certificate Issued Successfully!</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-left font-mono text-[11px] text-gray-700 space-y-1 mt-2">
                    <p><strong>ID:</strong> {issuedCert.certificateId}</p>
                    <p className="truncate"><strong>SHA256:</strong> {issuedCert.sha256Hash}</p>
                    <p className="truncate"><strong>Tx Hash:</strong> {issuedCert.blockchainTxHash}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    The PDF has been emailed and anchored to the Polygon Amoy blockchain.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              {!issuedCert ? (
                <>
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={issuing}
                    className="emerald-btn-primary px-6"
                  >
                    {issuing ? 'Generating...' : 'OK'}
                  </button>
                  <button
                    onClick={() => setConfirmReq(null)}
                    className="emerald-btn-secondary px-6"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmReq(null)}
                  className="emerald-btn-primary px-6"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
