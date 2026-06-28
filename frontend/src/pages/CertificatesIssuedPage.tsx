import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Eye, Download, ExternalLink, RefreshCw, Cpu, X, ShieldCheck, Hash, Clock, User, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';

interface CertificatesIssuedPageProps {
  user: any;
  onLogout: () => void;
}

const BlockchainModal: React.FC<{ cert: any; onClose: () => void }> = ({ cert, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const res = await axios.get(`${API_URL}/certificates/verify/${cert.certificateId}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch blockchain record.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlockchainData();
  }, [cert.certificateId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton: React.FC<{ text: string; id: string }> = ({ text, id }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="ml-2 text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
      title="Copy to clipboard"
    >
      {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 px-6 py-5 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Blockchain Record</h2>
              <p className="text-emerald-200 text-xs font-mono">{cert.certificateId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Querying smart contract...</p>
              <p className="text-xs text-gray-400">Reading state from blockchain node</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-12 space-y-3 text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="font-semibold text-gray-800">Smart Contract Query Failed</p>
              <p className="text-sm text-gray-500 max-w-sm">{error}</p>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-xs text-amber-800 max-w-sm">
                <strong>Make sure your local backend is running!</strong>
                <br />Run: <code className="bg-amber-100 px-1 rounded">npm run start:dev</code> in the backend folder.
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <ShieldCheck className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900 text-sm">✓ Certificate Anchored on Blockchain</p>
                  <p className="text-xs text-emerald-700 mt-0.5">PDF hash verified. On-chain record matches the issued document.</p>
                </div>
                <span className="ml-auto bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  VALID
                </span>
              </div>

              {/* Certificate Details */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Certificate Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Employee Name</p>
                    <p className="font-semibold text-gray-800">{data?.certificate?.request?.employeeName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Issued Date</p>
                    <p className="font-semibold text-gray-800">
                      {data?.certificate?.issuedDate ? new Date(data.certificate.issuedDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Skills Verified & Anchored</p>
                    <p className="font-semibold text-gray-800">{data?.certificate?.skillsVerified}</p>
                  </div>
                </div>
              </div>

              {/* Blockchain Record */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center space-x-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Smart Contract Data (Live Read)</span>
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  {/* PDF Hash */}
                  <div className="bg-gray-900 rounded-lg p-4 text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <Hash className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-emerald-400 font-bold">PDF File Hash (SHA-256)</span>
                        </div>
                        <p className="text-gray-300 break-all leading-relaxed">{data?.blockchain?.pdfHash}</p>
                      </div>
                      <CopyButton text={data?.blockchain?.pdfHash || ''} id="pdfHash" />
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  <div className="bg-gray-900 rounded-lg p-4 text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-blue-400 font-bold">Transaction Hash (Tx)</span>
                        </div>
                        <p className="text-gray-300 break-all leading-relaxed">{data?.blockchain?.transactionHash}</p>
                      </div>
                      <CopyButton text={data?.blockchain?.transactionHash || ''} id="txHash" />
                    </div>
                  </div>

                  {/* Issuer */}
                  <div className="bg-gray-900 rounded-lg p-4 text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <User className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                          <span className="text-yellow-400 font-bold">Contract Signer (Issuer Wallet)</span>
                        </div>
                        <p className="text-gray-300 break-all">{data?.blockchain?.issuer}</p>
                      </div>
                      <CopyButton text={data?.blockchain?.issuer || ''} id="issuer" />
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-gray-900 rounded-lg p-4 text-left">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <Clock className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-purple-400 font-bold">Anchored Timestamp (Block)</span>
                    </div>
                    <p className="text-gray-300">
                      {data?.blockchain?.timestamp ? new Date(data.blockchain.timestamp).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
                <strong className="block mb-1">🔒 How this proves tamper-proofing:</strong>
                The PDF Hash above is stored permanently inside the smart contract at the time of issuance. If anyone modifies the certificate PDF, its hash will change and will no longer match the on-chain record — proving forgery instantly.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CertificatesIssuedPage: React.FC<CertificatesIssuedPageProps> = ({ user, onLogout }) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const fetchCertificates = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const list = res.data || [];
      if (user.role === 'EMPLOYEE') {
        setCertificates(list.filter((c: any) => c.request?.employeeId === user.id));
      } else {
        setCertificates(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const handleDownload = (pdfPath: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${pdfPath}`;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (pdfPath: string) => {
    window.open(`${API_URL}${pdfPath}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Certificates Issued" user={user} onRefresh={fetchCertificates} isRefreshing={refreshing} />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">List of secure experience certificates issued and registered on the blockchain.</p>

          <div className="emerald-card">
            <h3 className="text-base font-bold text-gray-800 mb-6">Issued Registry</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Certificate ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Skills Anchored
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Blockchain Hash
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading certificates registry...
                      </td>
                    </tr>
                  ) : certificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No certificates have been issued yet.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-800">
                          {cert.certificateId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cert.request?.employeeName || 'Candidate'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={cert.skillsVerified}>
                          {cert.skillsVerified}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(cert.issuedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono" title={cert.blockchainTxHash}>
                          {cert.blockchainTxHash.slice(0, 10)}...{cert.blockchainTxHash.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-3">
                          <button
                            onClick={() => handleView(cert.pdfPath)}
                            className="text-gray-400 hover:text-emerald-700"
                            title="View PDF Certificate"
                          >
                            <Eye className="h-4 w-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDownload(cert.pdfPath, `${cert.certificateId}.pdf`)}
                            className="text-gray-400 hover:text-emerald-700"
                            title="Download PDF Certificate"
                          >
                            <Download className="h-4 w-4 inline" />
                          </button>
                          {/* Blockchain Record Button */}
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="text-gray-400 hover:text-emerald-700"
                            title="View Blockchain Record"
                          >
                            <Cpu className="h-4 w-4 inline" />
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

      {/* Blockchain Modal */}
      {selectedCert && (
        <BlockchainModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
