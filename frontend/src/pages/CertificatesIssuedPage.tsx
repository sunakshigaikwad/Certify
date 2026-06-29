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
      className="relative bg-white select-none shrink-0"
      style={{
        width: '800px',
        height: '565px',
        backgroundColor: '#022c16',
        padding: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top-Right Corner Wavy Shapes (Gold & Green) */}
      <svg className="absolute top-0 right-0 w-64 h-64 pointer-events-none z-10" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 0C130 60 170 120 250 140V0H80Z" fill="#011c0e" />
        <path d="M80 0C130 60 170 120 250 140" stroke="#d9780f" strokeWidth="4" />
        
        <path d="M120 0C160 50 190 90 250 105V0H120Z" fill="#14532d" />
        <path d="M120 0C160 50 190 90 250 105" stroke="#fbbf24" strokeWidth="2.5" />
        
        <path d="M160 0C190 40 210 60 250 70V0H160Z" fill="#16a34a" />
        <path d="M160 0C190 40 210 60 250 70" stroke="#fcd34d" strokeWidth="1" />
      </svg>

      {/* Bottom-Left Corner Wavy Shapes (Gold & Green) */}
      <svg className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none z-10" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 170C80 190 120 210 170 250H0V170Z" fill="#011c0e" />
        <path d="M0 170C80 190 120 210 170 250" stroke="#d9780f" strokeWidth="4" />
        
        <path d="M0 195C60 210 90 220 130 250H0V195Z" fill="#14532d" />
        <path d="M0 195C60 210 90 220 130 250" stroke="#fbbf24" strokeWidth="2.5" />
        
        <path d="M0 220C40 230 60 235 90 250H0V220Z" fill="#16a34a" />
        <path d="M0 220C40 230 60 235 90 250" stroke="#fcd34d" strokeWidth="1" />
      </svg>

      {/* Inner white container representing the certificate face */}
      <div className="w-full h-full bg-white relative p-10 flex flex-col justify-between" style={{ zIndex: 5 }}>
        
        {/* Decorative Frame Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 768 533" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 40 15 L 728 15 A 25 25 0 0 0 753 40 L 753 493 A 25 25 0 0 0 728 518 L 40 518 A 25 25 0 0 0 15 493 L 15 40 A 25 25 0 0 0 40 15 Z"
            stroke="#d97706"
            strokeWidth="3.5"
          />
          <path
            d="M 45 20 L 723 20 A 20 20 0 0 0 743 40 L 743 493 A 20 20 0 0 0 723 513 L 45 513 A 20 20 0 0 0 25 493 L 25 40 A 20 20 0 0 0 45 20 Z"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
        </svg>

        {/* Header Row */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-emerald-800 flex-shrink-0" />
            <div>
              <p className="text-emerald-900 font-extrabold text-base tracking-wide" style={{ fontFamily: 'sans-serif' }}>
                CertifyPro
              </p>
              <p className="text-gray-400 text-[9px] uppercase tracking-widest" style={{ fontFamily: 'sans-serif' }}>
                Chain of Trust
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold" style={{ fontFamily: 'sans-serif' }}>
              Certificate ID
            </p>
            <p className="text-[11px] font-mono text-gray-700 mt-0.5 font-bold">
              {cert.certificateId}
            </p>
            <p className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: 'sans-serif' }}>
              {new Date(cert.issuedDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Certificate Title Banner */}
        <div className="text-center relative z-10 my-1">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-600" style={{ fontFamily: 'sans-serif' }}>
              Certificate of Experience
            </span>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
          <p className="text-[11px] text-gray-400 italic font-medium" style={{ fontFamily: 'sans-serif' }}>
            This document certifies that
          </p>
        </div>

        {/* Name of Employee */}
        <div className="text-center relative z-10">
          <h1
            className="text-4xl font-extrabold text-emerald-955 mb-1 tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: '0px 1px 1px rgba(0,0,0,0.1)' }}
          >
            {cert.request?.employeeName}
          </h1>
          <p className="text-[11px] text-gray-500 font-medium" style={{ fontFamily: 'sans-serif' }}>
            {cert.request?.employeeEmail}
          </p>
        </div>

        {/* Description Text */}
        <p
          className="text-center text-[13px] text-gray-600 leading-relaxed max-w-xl mx-auto relative z-10"
          style={{ fontFamily: 'sans-serif' }}
        >
          has successfully completed their tenure at <strong className="text-emerald-900">CertifyPro Enterprise</strong> for a duration of <strong className="text-gray-800">{cert.request?.duration}</strong>. During this period, their performance was highly satisfactory, maintaining an exemplary attendance rate of <strong className="text-gray-800">{cert.request?.attendance}%</strong>.
        </p>

        {/* Skills Endorsed */}
        <div className="relative z-10">
          <p className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2" style={{ fontFamily: 'sans-serif' }}>
            Skills Verified &amp; Endorsed
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(cert.skillsVerified || '').split(',').map((skill: string, i: number) => (
              <span
                key={i}
                className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-sm"
                style={{
                  fontFamily: 'sans-serif',
                  background: '#f0fdf4',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  letterSpacing: '0.05em'
                }}
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Divider line inside frame */}
        <div className="h-px bg-gray-100 w-11/12 mx-auto relative z-10 my-1" />

        {/* Footer Row: Signatures + QR + Blockchain stamp */}
        <div className="flex items-end justify-between px-4 relative z-10">
          {/* Authorized Signatory */}
          <div className="w-32">
            <p className="text-sm font-extrabold text-gray-800 mb-0.5" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              HR Admin
            </p>
            <div className="w-24 h-px bg-gray-300 mb-1" />
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>
              Authorized Signatory
            </p>
            <p className="text-[9px] text-gray-400" style={{ fontFamily: 'sans-serif' }}>
              CertifyPro Enterprise
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white border border-gray-200 p-0.5 rounded shadow-sm">
              <QRCodeImage value={verificationUrl} size={80} />
            </div>
            <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-wider font-semibold" style={{ fontFamily: 'sans-serif' }}>
              Scan to verify
            </p>
          </div>

          {/* Blockchain Seal */}
          <div className="text-right w-44">
            <div className="flex items-center justify-end space-x-1.5 mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide" style={{ fontFamily: 'sans-serif' }}>
                Blockchain Secured
              </span>
            </div>
            <p className="text-[8.5px] text-gray-400 font-mono break-all leading-tight">
              {blockchainData?.transactionHash?.slice(0, 24) || cert.blockchainTxHash?.slice(0, 24)}...
            </p>
            <p className="text-[9px] text-emerald-700/80 font-semibold uppercase tracking-wider mt-0.5" style={{ fontFamily: 'sans-serif' }}>
              Polygon Smart Contract
              </p>
            </div>
          </div>
        </div>
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
                        <p className="text-gray-300 break-all">
                          {key === 'txHash' && value && value.startsWith('0x') ? (
                            <a
                              href={`https://amoy.polygonscan.com/tx/${value}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </p>
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
