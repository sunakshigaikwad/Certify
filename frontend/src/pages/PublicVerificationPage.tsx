import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, ShieldCheck, Download, Search, AlertCircle, Award, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

interface PublicVerificationPageProps {
  user?: any;
  onLogout?: () => void;
}

// QR code generated dynamically using free public API — no server file needed
const QRCodeImage: React.FC<{ value: string; size?: number }> = ({ value, size = 100 }) => {
  const encoded = encodeURIComponent(value);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=1a4731&qzone=1`;
  return <img src={src} alt="QR Verification Code" className="w-full h-full object-contain" />;
};

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({ user, onLogout }) => {
  const isLoggedIn = !!localStorage.getItem('token') || !!user;
  const { certificateId } = useParams<{ certificateId?: string }>();
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
      setErrorMsg(err.response?.data?.message || 'Certificate not found. Verify ID formatting.');
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

  const handleDownload = (pdfPath: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${pdfPath}`;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verificationUrl = result
    ? `${window.location.origin}/verify/${result.certificate.certificateId}`
    : '';

  const renderVerificationContent = () => (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-8">
        <ShieldCheck className="h-14 w-14 text-emerald-700 mx-auto mb-3" />
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Public Verification Portal</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
          Input a Certificate ID to verify the authenticity of an employee experience certificate against Polygon Blockchain logs.
        </p>
      </div>

      {/* Search form */}
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
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-6 rounded text-sm transition-colors duration-150 shadow-sm"
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

      {/* Results Panel */}
      {result && (
        <div className="w-full space-y-6">
          {/* Status Bar */}
          <div className="bg-white border border-gray-200 rounded p-6 shadow-sm text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <ShieldCheck className="h-6 w-6" />
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
                  onClick={() => handleDownload(result.certificate.pdfPath, `${result.certificate.certificateId}.pdf`)}
                  className="emerald-btn-primary py-1.5 px-3 flex items-center space-x-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate Details</h4>
                <div className="mt-2 space-y-1">
                  <p className="font-bold text-gray-900 text-base">{result.certificate.request.employeeName}</p>
                  <p className="text-gray-600">{result.certificate.request.employeeEmail}</p>
                  <p className="text-gray-600">Tenure: {result.certificate.request.duration}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Issuer Organization</h4>
                <div className="mt-2 space-y-1">
                  <p className="font-bold text-gray-900">CertifyPro Enterprise</p>
                  <p className="text-gray-600">Verified Skills: <span className="font-semibold text-gray-900">{result.certificate.skillsVerified}</span></p>
                </div>
              </div>
              <div className="md:col-span-2 border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cryptographic Audit Proof</h4>
                <div className="bg-gray-50 rounded p-4 font-mono text-xs space-y-2 border border-gray-100 text-gray-700">
                  <p className="break-all"><strong>PDF File Hash (SHA-256):</strong> {result.certificate.sha256Hash}</p>
                  <p className="break-all"><strong>On-Chain Anchor Hash:</strong> {result.blockchain.pdfHash}</p>
                  <p className="break-all"><strong>Smart Contract Transaction:</strong> {result.blockchain.transactionHash}</p>
                  <p><strong>Contract Signer/Issuer:</strong> {result.blockchain.issuer}</p>
                  <p><strong>Anchored Timestamp:</strong> {new Date(result.blockchain.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ======== PROFESSIONAL CERTIFICATE PREVIEW ======== */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Certificate Preview</h3>

            {/* Certificate Card */}
            <div
              className="relative max-w-3xl mx-auto overflow-hidden rounded-lg"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                border: '2px solid #15803d',
                boxShadow: '0 8px 40px rgba(21,128,61,0.12)',
              }}
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-yellow-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-yellow-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-yellow-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-yellow-500 rounded-br-lg" />

              {/* Top Banner */}
              <div
                className="px-10 pt-7 pb-4 flex items-center justify-between"
                style={{ borderBottom: '2px solid #dcfce7' }}
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-emerald-700 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-extrabold text-sm tracking-wide leading-none">CertifyPro</p>
                    <p className="text-emerald-600 text-[9px] uppercase tracking-widest font-semibold">Chain of Trust</p>
                  </div>
                </div>

                {/* Seal / Badge */}
                <div
                  className="flex flex-col items-center justify-center h-16 w-16 rounded-full border-4 border-yellow-500"
                  style={{ background: 'linear-gradient(135deg, #15803d, #166534)' }}
                >
                  <Award className="h-5 w-5 text-yellow-300" />
                  <p className="text-yellow-200 text-[7px] font-bold uppercase tracking-wider mt-0.5">Certified</p>
                </div>

                <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                  CertifyPro Enterprise
                </p>
              </div>

              {/* Main Body */}
              <div className="px-10 py-6 text-center">
                {/* Decorative line */}
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-400" />
                  <span className="text-yellow-500 text-xs font-bold tracking-widest uppercase">Certificate of Experience</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-400" />
                </div>

                <p className="text-gray-400 text-xs italic mb-2">This certificate is proudly presented to</p>

                {/* Candidate Name */}
                <div className="relative inline-block mb-4">
                  <p
                    className="text-3xl font-extrabold tracking-tight pb-1"
                    style={{ color: '#14532d', fontFamily: 'Georgia, serif' }}
                  >
                    {result.certificate.request.employeeName}
                  </p>
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded" />
                </div>

                <p className="text-gray-600 text-xs max-w-lg mx-auto leading-6 mb-4">
                  In recognition of their exceptional contribution and dedication to the organization during the tenure of{' '}
                  <strong className="text-gray-800">{result.certificate.request.duration}</strong>, maintaining an exemplary
                  attendance rate of{' '}
                  <strong className="text-gray-800">{result.certificate.request.attendance}%</strong>.
                </p>

                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {result.certificate.skillsVerified.split(',').map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="flex items-center space-x-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                    >
                      <CheckCircle className="h-2.5 w-2.5" />
                      <span>{skill.trim()}</span>
                    </span>
                  ))}
                </div>

                {/* Signature Row */}
                <div
                  className="flex items-end justify-between px-6 pt-4 mt-2"
                  style={{ borderTop: '1px dashed #bbf7d0' }}
                >
                  {/* Left: Authorized Signatory */}
                  <div className="text-center w-36">
                    <div className="h-8 flex items-end justify-center mb-1">
                      <p
                        className="text-sm font-bold italic"
                        style={{ color: '#15803d', fontFamily: 'cursive' }}
                      >
                        HR Admin
                      </p>
                    </div>
                    <div className="border-t border-gray-300 pt-1">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Authorized Signatory</p>
                      <p className="text-[9px] text-gray-400">CertifyPro Enterprise</p>
                    </div>
                  </div>

                  {/* Center: QR Code — dynamically generated */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 bg-white border-2 border-emerald-300 rounded-lg overflow-hidden shadow-sm p-1"
                    >
                      <QRCodeImage value={verificationUrl} size={100} />
                    </div>
                    <p className="text-[8px] text-gray-400 mt-1 font-mono">Scan to verify</p>
                  </div>

                  {/* Right: Blockchain Verifier */}
                  <div className="text-center w-36">
                    <div className="h-8 flex items-end justify-center mb-1">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="border-t border-gray-300 pt-1">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Blockchain Verifier</p>
                      <p className="text-[9px] text-gray-400">Smart Contract Audited</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Strip */}
              <div
                className="px-8 py-2.5 flex items-center justify-between text-[8px]"
                style={{ background: 'linear-gradient(90deg, #14532d, #166534)', color: '#bbf7d0' }}
              >
                <span className="font-mono">Cert ID: {result.certificate.certificateId}</span>
                <span className="flex items-center space-x-1 font-bold tracking-wider uppercase">
                  <CheckCircle className="h-2.5 w-2.5 text-yellow-300" />
                  <span className="text-yellow-300">Blockchain Verified</span>
                </span>
                <span className="font-mono">Issued: {new Date(result.certificate.issuedDate).toLocaleDateString()}</span>
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
      <header className="border-b border-gray-100 py-4 px-8 bg-white flex items-center justify-between font-sans">
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
          <div className="w-full max-w-xl text-left mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 space-x-1 hover:underline"
            >
              <span>← Back to Dashboard Profile</span>
            </Link>
          </div>
        )}
        {renderVerificationContent()}
      </main>
    </div>
  );
};
