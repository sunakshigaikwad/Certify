import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GraduationCap, ShieldCheck, Download, Search, AlertCircle, DownloadCloud } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

interface PublicVerificationPageProps {
  user?: any;
  onLogout?: () => void;
}

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

  // Reusable search panel content
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
            <Search className="absolute left-3.5 top-3.5 text-gray-400 h-4.5 w-4.5" />
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
          {/* Blockchain Verified Badge & Details */}
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
                <span className="bg-emerald-105 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
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

            {/* Grid content */}
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
                  <p className="font-bold text-gray-900">Default Enterprise</p>
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

          {/* Certificate A4 Mock design preview */}
          <div className="bg-white border border-gray-200 rounded p-8 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Certificate Layout Preview</h3>
            
            {/* Mocking the PDF styling in HTML */}
            <div className="border-4 border-emerald-700 p-8 bg-gray-50/50 max-w-3xl mx-auto rounded relative shadow-inner overflow-hidden aspect-[1.414/1]">
              <div className="absolute top-4 left-4 right-4 h-12 bg-emerald-700 flex items-center justify-between px-6 text-white rounded">
                <span className="font-bold text-sm">CertifyPro — Chain of Trust</span>
                <span className="text-xs uppercase tracking-wider">Default Enterprise</span>
              </div>

              <div className="pt-20 text-center space-y-4">
                <h2 className="text-2xl font-extrabold text-emerald-800">CERTIFICATE OF EXPERIENCE</h2>
                <p className="text-xs text-gray-500">This is proudly presented to</p>
                <p className="text-xl font-bold text-gray-900 border-b border-gray-200 w-fit mx-auto pb-1 px-8">{result.certificate.request.employeeName}</p>
                
                <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
                  In recognition of their exceptional work and contribution to the organization during the tenure from <strong className="text-gray-900">{result.certificate.request.duration}</strong> with an overall attendance rate of <strong className="text-gray-900">{result.certificate.request.attendance}%</strong>.
                </p>
                
                <div className="pt-4">
                  <span className="text-xs font-bold text-emerald-700 block mb-1">VERIFIED SKILLS</span>
                  <p className="text-xs font-medium text-gray-800 uppercase tracking-wide">
                    {result.certificate.skillsVerified.split(',').join('  •  ')}
                  </p>
                </div>

                <div className="pt-8 flex justify-between px-8">
                  <div className="text-center w-36 border-t border-gray-300 pt-1 text-[10px] text-gray-500">
                    <strong>Authorized Signatory</strong>
                    <p>Default Enterprise</p>
                  </div>
                  
                  {/* QR Code image overlay */}
                  <div className="w-16 h-16 border border-emerald-200 p-0.5 bg-white shrink-0 -mt-4">
                    <img src={`${API_URL}${result.certificate.qrCodePath}`} alt="QR Verification Link" className="w-full h-full" />
                  </div>

                  <div className="text-center w-36 border-t border-gray-300 pt-1 text-[10px] text-gray-500">
                    <strong>Blockchain Verifier</strong>
                    <p>Smart Contract Audited</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 text-[8px] text-gray-400 space-y-0.5 text-left">
                <p>Certificate ID: {result.certificate.certificateId}</p>
                <p>Issue Date: {new Date(result.certificate.issuedDate).toLocaleDateString()}</p>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-emerald-50 text-emerald-800 text-[8px] font-bold border border-emerald-200 rounded px-2 py-0.5">
                ✓ BLOCKCHAIN VERIFIED
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
      {/* Header */}
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

      {/* Main Search Panel */}
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
