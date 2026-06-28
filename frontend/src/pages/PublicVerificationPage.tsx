import { API_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GraduationCap, ShieldCheck, Download, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

interface PublicVerificationPageProps {
  user?: any;
  onLogout?: () => void;
}

const QRCodeImage: React.FC<{ value: string; size?: number }> = ({ value, size = 80 }) => {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=1a4731&qzone=1`;
  return <img src={src} alt="QR Verification" className="w-full h-full object-contain" crossOrigin="anonymous" />;
};

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({ user, onLogout }) => {
  const isLoggedIn = !!localStorage.getItem('token') || !!user;
  const { certificateId } = useParams<{ certificateId?: string }>();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const fetchCertificate = async (id: string) => {
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    try {
      const res = await axios.get(`${API_URL}/certificates/verify/${id}`);
      setResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Certificate not found. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateId) {
      setCertId(certificateId);
      fetchCertificate(certificateId);
    }
  }, [certificateId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    fetchCertificate(certId.trim());
  };

  const downloadCertificateAsPDF = async () => {
    if (!certRef.current || !result) return;
    setDownloading(true);
    try {
      // Wait for QR code image to fully load
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(certRef.current, {
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
      pdf.save(`${result.certificate.certificateId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const verificationUrl = result
    ? `${window.location.origin}/verify/${result.certificate.certificateId}`
    : '';

  const renderVerificationContent = () => (
    <div className="w-full flex flex-col items-center">
      {/* Page Header */}
      <div className="text-center mb-8">
        <ShieldCheck className="h-14 w-14 text-emerald-700 mx-auto mb-3" />
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Public Verification Portal</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
          Enter a Certificate ID to verify the authenticity of an experience certificate on the blockchain.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="w-full max-w-xl bg-white border border-gray-200 rounded p-6 shadow-sm mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CP-123456...)"
              className="block w-full rounded border border-gray-300 pl-10 pr-3 py-3 text-sm focus:border-emerald-600 focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3.5 text-gray-400 h-4 w-4" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-6 rounded text-sm transition-colors shadow-sm"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {errorMsg && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded p-3.5 text-sm flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Result Panel */}
      {result && (
        <div className="w-full space-y-6">
          {/* Verification Summary Card */}
          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Blockchain Verified</h3>
                  <p className="text-xs text-gray-500 font-mono">ID: {result.certificate.certificateId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ HASH MATCH VERIFIED
                </span>
                <button
                  onClick={downloadCertificateAsPDF}
                  disabled={downloading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 px-4 rounded text-sm flex items-center space-x-1.5 transition-colors disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Candidate</h4>
                <p className="font-bold text-gray-900">{result.certificate.request.employeeName}</p>
                <p className="text-gray-500">{result.certificate.request.employeeEmail}</p>
                <p className="text-gray-500">Tenure: {result.certificate.request.duration}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Issuer</h4>
                <p className="font-bold text-gray-900">CertifyPro Enterprise</p>
                <p className="text-gray-500">Skills: <span className="font-semibold text-gray-700">{result.certificate.skillsVerified}</span></p>
              </div>
              <div className="md:col-span-2 border-t border-gray-100 pt-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cryptographic Proof</h4>
                <div className="bg-gray-50 rounded p-4 font-mono text-xs space-y-1.5 border border-gray-100 text-gray-600">
                  <p className="break-all"><strong>PDF Hash (SHA-256):</strong> {result.certificate.sha256Hash}</p>
                  <p className="break-all"><strong>On-Chain Hash:</strong> {result.blockchain.pdfHash}</p>
                  <p className="break-all"><strong>Transaction:</strong> {result.blockchain.transactionHash}</p>
                  <p><strong>Issuer Wallet:</strong> {result.blockchain.issuer}</p>
                  <p><strong>Anchored:</strong> {new Date(result.blockchain.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== ELITE/PROFESSIONAL CERTIFICATE PREVIEW ===== */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Certificate Preview</h3>

            <div className="w-full overflow-x-auto pb-4">
              <div
                ref={certRef}
                className="relative bg-white select-none shrink-0 mx-auto"
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
                        {result.certificate.certificateId}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: 'sans-serif' }}>
                        {new Date(result.certificate.issuedDate).toLocaleDateString('en-IN', {
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
                      {result.certificate.request.employeeName}
                    </h1>
                    <p className="text-[11px] text-gray-500 font-medium" style={{ fontFamily: 'sans-serif' }}>
                      {result.certificate.request.employeeEmail}
                    </p>
                  </div>

                  {/* Description Text */}
                  <p
                    className="text-center text-[13px] text-gray-600 leading-relaxed max-w-xl mx-auto relative z-10"
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    has successfully completed their tenure at <strong className="text-emerald-900">CertifyPro Enterprise</strong> for a duration of <strong className="text-gray-800">{result.certificate.request.duration}</strong>. During this period, their performance was highly satisfactory, maintaining an exemplary attendance rate of <strong className="text-gray-800">{result.certificate.request.attendance}%</strong>.
                  </p>

                  {/* Skills Endorsed */}
                  <div className="relative z-10">
                    <p className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2" style={{ fontFamily: 'sans-serif' }}>
                      Skills Verified &amp; Endorsed
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {result.certificate.skillsVerified.split(',').map((skill: string, i: number) => (
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
                        {result.blockchain.transactionHash?.slice(0, 24)}...
                      </p>
                      <p className="text-[9px] text-emerald-700/80 font-semibold uppercase tracking-wider mt-0.5" style={{ fontFamily: 'sans-serif' }}>
                        Polygon Smart Contract
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render dashboard version if logged in
  if (user && onLogout) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="flex-1 pl-64 pt-16">
          <Topbar title="Verification Portal" user={user} />
          <main className="p-8 max-w-4xl mx-auto w-full flex flex-col items-center">
            {renderVerificationContent()}
          </main>
        </div>
      </div>
    );
  }

  // Render public version if not logged in
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <header className="border-b border-gray-100 py-4 px-8 bg-white flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-emerald-700">
          <GraduationCap className="h-9 w-9" />
          <span className="text-2xl font-bold tracking-tight">CertifyPro</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-emerald-700 font-medium text-sm">Home</Link>
          {isLoggedIn ? (
            <Link to="/dashboard" className="text-gray-600 hover:text-emerald-700 font-medium text-sm">Dashboard</Link>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-emerald-700 font-medium text-sm">Sign In</Link>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center py-16 px-4 max-w-4xl mx-auto w-full">
        {isLoggedIn && (
          <div className="w-full text-left mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}
        {renderVerificationContent()}
      </main>
    </div>
  );
};
