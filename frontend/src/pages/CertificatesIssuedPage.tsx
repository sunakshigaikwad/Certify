import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import {
  Eye, Download, RefreshCw, Cpu, X, ShieldCheck, Hash, Clock,
  User, CheckCircle2, AlertTriangle, Copy, Check, CheckCircle,
  Loader2, FileText
} from 'lucide-react';

interface CertificatesIssuedPageProps {
  user: any;
  onLogout: () => void;
}

// ── Shared QR generator ──────────────────────────────────────────────────────
const QRCodeImage: React.FC<{ value: string; size?: number }> = ({ value, size = 80 }) => {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=1a4731&qzone=1`;
  return <img src={src} alt="QR Verification" className="w-full h-full object-contain" crossOrigin="anonymous" />;
};

// ── Certificate Preview Card ─────────────────────────────────────────────────
const CertificateCard: React.FC<{ cert: any; blockchainData: any; cardRef: React.RefObject<HTMLDivElement> }> = ({ cert, blockchainData, cardRef }) => {
  const verificationUrl = `${window.location.origin}/verify/${cert.certificateId}`;
  return (
    <div
      ref={cardRef}
      className="relative bg-white overflow-hidden"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: 'linear-gradient(180deg, #14532d, #15803d)' }} />

      <div className="pl-10 pr-10 pt-10 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700 flex-shrink-0" />
            <div>
              <p className="text-emerald-800 font-bold text-sm tracking-wide">CertifyPro</p>
              <p className="text-gray-400 text-[9px] uppercase tracking-widest">Blockchain-Verified Certificate</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Certificate ID</p>
            <p className="text-[10px] font-mono text-gray-600 mt-0.5">{cert.certificateId}</p>
            <p className="text-[9px] text-gray-400 mt-1">
              {new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
            Certificate of Experience
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Name */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 italic mb-3">This is to certify that</p>
          <h1
            className="text-4xl font-bold text-gray-900 tracking-tight mb-1"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {cert.request?.employeeName}
          </h1>
          <p className="text-xs text-gray-400">{cert.request?.employeeEmail}</p>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 text-center leading-7 max-w-lg mx-auto mb-7">
          has successfully served and contributed to{' '}
          <strong className="text-gray-800">CertifyPro Enterprise</strong> during the tenure of{' '}
          <strong className="text-gray-800">{cert.request?.duration}</strong>, maintaining an exemplary
          attendance of <strong className="text-gray-800">{cert.request?.attendance}%</strong>.
        </p>

        {/* Skills */}
        <div className="mb-8">
          <p className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Skills Verified &amp; Endorsed
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(cert.skillsVerified || '').split(',').map((skill: string, i: number) => (
              <span
                key={i}
                className="text-[10px] font-semibold uppercase tracking-wider px-4 py-1.5"
                style={{ background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' }}
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-6" />

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold italic text-gray-700 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              HR Admin
            </p>
            <div className="w-24 h-px bg-gray-400 mb-1" />
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Authorized Signatory</p>
            <p className="text-[9px] text-gray-400">CertifyPro Enterprise</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border border-gray-200 bg-white p-0.5">
              <QRCodeImage value={verificationUrl} size={80} />
            </div>
            <p className="text-[8px] text-gray-400 mt-1">Scan to verify</p>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end space-x-1 mb-1">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Blockchain Verified</span>
            </div>
            <p className="text-[9px] text-gray-400 font-mono max-w-[150px] text-right break-all">
              {blockchainData?.transactionHash?.slice(0, 24) || cert.blockchainTxHash?.slice(0, 24)}...
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">Polygon Smart Contract</p>
          </div>
        </div>
      </div>

      {/* Bottom stripe */}
      <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #14532d, #16a34a)' }} />
    </div>
  );
};

// ── Certificate Preview Modal ────────────────────────────────────────────────
const CertificatePreviewModal: React.FC<{ cert: any; onClose: () => void }> = ({ cert, onClose }) => {
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [loadingBC, setLoadingBC] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${API_URL}/certificates/verify/${cert.certificateId}`)
      .then(res => setBlockchainData(res.data?.blockchain))
      .catch(() => setBlockchainData(null))
      .finally(() => setLoadingBC(false));
  }, [cert.certificateId]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // wait for QR to load
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${cert.certificateId}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-xl"
          style={{ background: 'linear-gradient(135deg, #14532d, #15803d)' }}
        >
          <div className="flex items-center space-x-3 text-white">
            <div className="h-9 w-9 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">Certificate Preview</p>
              <p className="text-emerald-200 text-xs font-mono">{cert.certificateId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              disabled={downloading || loadingBC}
              className="flex items-center space-x-2 bg-white text-emerald-800 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-emerald-50 transition-colors disabled:opacity-60"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div className="p-6">
          {loadingBC ? (
            <div className="flex flex-col items-center py-12 space-y-3">
              <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading certificate data...</p>
            </div>
          ) : (
            <CertificateCard cert={cert} blockchainData={blockchainData} cardRef={cardRef} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Blockchain Record Modal ──────────────────────────────────────────────────
const BlockchainModal: React.FC<{ cert: any; onClose: () => void }> = ({ cert, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/certificates/verify/${cert.certificateId}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch blockchain record.'))
      .finally(() => setLoading(false));
  }, [cert.certificateId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn: React.FC<{ text: string; id: string }> = ({ text, id }) => (
    <button onClick={() => copyToClipboard(text, id)} className="ml-2 text-gray-400 hover:text-emerald-600 flex-shrink-0">
      {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 px-6 py-5 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Blockchain Record</h2>
              <p className="text-emerald-200 text-xs font-mono">{cert.certificateId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-16 space-y-4">
              <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Querying smart contract...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-12 space-y-3 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="font-semibold text-gray-800">Smart Contract Query Failed</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <ShieldCheck className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-emerald-900 text-sm">✓ Certificate Anchored on Blockchain</p>
                  <p className="text-xs text-emerald-700 mt-0.5">On-chain record matches the issued document.</p>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">VALID</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Employee</p>
                  <p className="font-semibold text-gray-800">{data?.certificate?.request?.employeeName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Issued Date</p>
                  <p className="font-semibold text-gray-800">
                    {data?.certificate?.issuedDate ? new Date(data.certificate.issuedDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Skills Verified</p>
                  <p className="font-semibold text-gray-800">{data?.certificate?.skillsVerified}</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { icon: <Hash className="h-3.5 w-3.5 text-emerald-400" />, label: 'PDF File Hash (SHA-256)', color: 'text-emerald-400', value: data?.blockchain?.pdfHash, key: 'pdfHash' },
                  { icon: <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />, label: 'Transaction Hash (Tx)', color: 'text-blue-400', value: data?.blockchain?.transactionHash, key: 'txHash' },
                  { icon: <User className="h-3.5 w-3.5 text-yellow-400" />, label: 'Issuer Wallet Address', color: 'text-yellow-400', value: data?.blockchain?.issuer, key: 'issuer' },
                ].map(({ icon, label, color, value, key }) => (
                  <div key={key} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center space-x-2 mb-1.5 ${color}`}>
                          {icon}
                          <span className="font-bold">{label}</span>
                        </div>
                        <p className="text-gray-300 break-all">{value}</p>
                      </div>
                      <CopyBtn text={value || ''} id={key} />
                    </div>
                  </div>
                ))}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1.5 text-purple-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-bold">Anchored Timestamp</span>
                  </div>
                  <p className="text-gray-300">
                    {data?.blockchain?.timestamp ? new Date(data.blockchain.timestamp).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
                <strong className="block mb-1">🔒 Tamper-proof verification:</strong>
                The PDF hash is permanently stored in the smart contract. Any modification to the PDF will produce a different hash — proving forgery instantly.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
export const CertificatesIssuedPage: React.FC<CertificatesIssuedPageProps> = ({ user, onLogout }) => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [blockchainCert, setBlockchainCert] = useState<any | null>(null);

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

  useEffect(() => { fetchCertificates(); }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-64 pt-16">
        <Topbar title="Certificates Issued" user={user} onRefresh={fetchCertificates} isRefreshing={refreshing} />

        <main className="p-8">
          <p className="text-xs text-gray-500 mb-6">
            List of secure experience certificates issued and registered on the blockchain.
          </p>

          <div className="emerald-card">
            <h3 className="text-base font-bold text-gray-800 mb-6">Issued Registry</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {['Certificate ID', 'Employee', 'Skills Anchored', 'Issued Date', 'Blockchain Hash', 'Actions'].map(h => (
                      <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading certificates registry...</td></tr>
                  ) : certificates.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No certificates have been issued yet.</td></tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {/* Eye → Certificate Preview modal */}
                            <button
                              onClick={() => setPreviewCert(cert)}
                              title="Preview Certificate"
                              className="group flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 border border-emerald-200 hover:border-emerald-600"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Preview</span>
                            </button>

                            {/* Blockchain record */}
                            <button
                              onClick={() => setBlockchainCert(cert)}
                              title="View Blockchain Record"
                              className="flex items-center space-x-1 bg-gray-50 hover:bg-gray-800 text-gray-600 hover:text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 border border-gray-200 hover:border-gray-800"
                            >
                              <Cpu className="h-3 w-3" />
                              <span>Blockchain</span>
                            </button>
                          </div>
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

      {/* Modals */}
      {previewCert && <CertificatePreviewModal cert={previewCert} onClose={() => setPreviewCert(null)} />}
      {blockchainCert && <BlockchainModal cert={blockchainCert} onClose={() => setBlockchainCert(null)} />}
    </div>
  );
};
