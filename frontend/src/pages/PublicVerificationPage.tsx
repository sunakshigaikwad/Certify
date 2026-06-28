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

          {/* ===== CLEAN PROFESSIONAL CERTIFICATE ===== */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Certificate Preview</h3>

            <div
              ref={certRef}
              className="relative max-w-3xl mx-auto bg-white overflow-hidden"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              {/* Left green accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2"
                style={{ background: 'linear-gradient(180deg, #14532d, #15803d)' }}
              />

              <div className="pl-10 pr-10 pt-10 pb-8">
                {/* Header: Logo | Certificate ID + Date */}
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
                    <p className="text-[10px] font-mono text-gray-600 mt-0.5">{result.certificate.certificateId}</p>
                    <p className="text-[9px] text-gray-400 mt-1">
                      {new Date(result.certificate.issuedDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Section Divider */}
                <div className="flex items-center mb-8">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="mx-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                    Certificate of Experience
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Name Block */}
                <div className="text-center mb-6">
                  <p className="text-xs text-gray-400 italic mb-3">This is to certify that</p>
                  <h1
                    className="text-4xl font-bold text-gray-900 tracking-tight mb-1"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {result.certificate.request.employeeName}
                  </h1>
                  <p className="text-xs text-gray-400">{result.certificate.request.employeeEmail}</p>
                </div>

                {/* Body Text */}
                <p className="text-sm text-gray-600 text-center leading-7 max-w-lg mx-auto mb-7">
                  has successfully served and contributed to{' '}
                  <strong className="text-gray-800">CertifyPro Enterprise</strong> during the
                  tenure of <strong className="text-gray-800">{result.certificate.request.duration}</strong>, maintaining
                  an exemplary attendance of <strong className="text-gray-800">{result.certificate.request.attendance}%</strong>.
                </p>

                {/* Skills */}
                <div className="mb-8">
                  <p className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Skills Verified &amp; Endorsed
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.certificate.skillsVerified.split(',').map((skill: string, i: number) => (
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

                {/* Thin separator */}
                <div className="h-px bg-gray-100 mb-6" />

                {/* Footer: Signature | QR Code | Blockchain stamp */}
                <div className="flex items-end justify-between">
                  <div>
                    <p
                      className="text-sm font-bold italic text-gray-700 mb-1"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
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
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                        Blockchain Verified
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-mono max-w-[150px] text-right break-all">
                      {result.blockchain.transactionHash?.slice(0, 24)}...
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Polygon Smart Contract</p>
                  </div>
                </div>
              </div>

              {/* Bottom emerald stripe */}
              <div
                className="h-1.5"
                style={{ background: 'linear-gradient(90deg, #14532d, #16a34a)' }}
              />
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
