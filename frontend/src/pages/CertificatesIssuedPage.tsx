import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Eye, Download, Mail, ExternalLink, RefreshCw } from 'lucide-react';

interface CertificatesIssuedPageProps {
  user: any;
  onLogout: () => void;
}

export const CertificatesIssuedPage: React.FC<CertificatesIssuedPageProps> = ({ user, onLogout }) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCertificates = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // If employee, only show their own certificates
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
                          <a
                            href={`https://sepolia.etherscan.io/tx/${cert.blockchainTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-emerald-700"
                            title="View on Block Explorer"
                          >
                            <ExternalLink className="h-4 w-4 inline" />
                          </a>
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
