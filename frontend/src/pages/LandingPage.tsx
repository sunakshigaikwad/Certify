import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Shield, 
  CheckCircle, 
  Search, 
  Cpu, 
  CheckSquare, 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Building,
  Users,
  Award
} from 'lucide-react';

const LiveNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const count = 45;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw connecting lines (vibrant emerald green with better opacity)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1.0;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle dots
      ctx.fillStyle = 'rgba(4, 120, 87, 0.4)';
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
};

interface FAQItem {
  q: string;
  a: string;
}

export const LandingPage: React.FC = () => {
  // Carousel Active Slide State
  const [activeSlide, setActiveSlide] = useState(0);

  // Search Sandbox States
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const sampleDatabase: Record<string, any> = {
    'CP-9812': {
      id: 'CP-9812',
      candidate: 'Aksha Dhiwar',
      role: 'Software Engineer',
      issuer: "Rutuja's Software Pvt Ltd",
      tenure: 'Jan 2023 - Dec 2025',
      rating: '4.8 / 5.0 Stars',
      hash: '0x3a4b7f1ad91a039fa8e7162985123d4cfa8f2b3e401c23f8702b8d91a3b5c4e78',
      block: '8,491,823',
      gasUsed: '87,243',
      timestamp: '2026-06-25 14:32:01 UTC',
      skills: ['React', 'Python', 'Node.js', 'PostgreSQL']
    },
    'CP-9813': {
      id: 'CP-9813',
      candidate: 'Sunakshi Gaikwad',
      role: 'Lead Solidity Architect',
      issuer: 'Gaikwad Tech Solutions',
      tenure: 'Mar 2022 - Aug 2025',
      rating: '5.0 / 5.0 Stars',
      hash: '0x6e2c9d3ef8a1b32d2b8c91a3b5c4e78aef291bc82d039fa8e7162985123d4cf8',
      block: '8,492,042',
      gasUsed: '112,509',
      timestamp: '2026-06-26 09:15:47 UTC',
      skills: ['Solidity', 'Hardhat', 'Ethers.js', 'Rust']
    },
    'CP-9814': {
      id: 'CP-9814',
      candidate: 'Rutuja Ingale',
      role: 'Senior Project Lead',
      issuer: 'Ingale Consult Group',
      tenure: 'Jun 2021 - May 2025',
      rating: '4.9 / 5.0 Stars',
      hash: '0xf8a12b8c9d3e6e2c3a4b7f1ad91a039fa8e7162985123d4cfa8f2b3e401c23f87',
      block: '8,493,115',
      gasUsed: '94,188',
      timestamp: '2026-06-27 18:22:11 UTC',
      skills: ['Agile', 'Jira', 'NestJS', 'TypeScript']
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);

    setTimeout(() => {
      const match = sampleDatabase[searchId.trim().toUpperCase()];
      if (match) {
        setSearchResult(match);
      } else {
        setSearchError('Certificate Hash not matched or ID does not exist on this ledger node.');
      }
      setIsSearching(false);
    }, 1500);
  };

  const triggerQuickSample = (id: string) => {
    setSearchId(id);
    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);

    setTimeout(() => {
      setSearchResult(sampleDatabase[id]);
      setIsSearching(false);
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const carouselSlides = [
    {
      title: "Immutable Blockchain Anchoring",
      subtitle: "Cryptographic Certificate Sealing",
      desc: "Every issued certificate has its SHA-256 cryptographic hash anchored directly to Polygon smart contracts. This guarantees document immutability and complete tamper-proofing, rendering forgery impossible.",
      badge: "SECURITY BLOCKCHAIN",
      details: [
        "Cryptographic proof stored on decentralized ledger",
        "Permanent timestamping of record validation",
        "Deterministic check matching binary decisions"
      ],
      visual: (
        <div className="bg-slate-900 text-emerald-400 p-5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-2.5 shadow-lg text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-500">
            <span>[POLYGON AMOY REGISTER]</span>
            <span className="text-emerald-500 animate-pulse">● LIVE CONNECTION</span>
          </div>
          <p className="text-slate-300">&gt;&gt; Anchoring Document ID: CP-9814</p>
          <p className="break-all text-slate-300">&gt;&gt; File Hash: 0xa8f2b3e401c23f8702b8d91a3b5c4e78aef291bc82d039fa8e7162985123d4cf</p>
          <p className="text-emerald-400 font-bold">&gt;&gt; STATUS: HASH ANCHORED SUCCESSFULLY IN BLOCK #8491823</p>
          <p className="text-slate-400">&gt;&gt; Tx Receipt: 0x9f8e12b7a3...4e9d</p>
        </div>
      )
    },
    {
      title: "Intelligent AI Skill Pre-validation",
      subtitle: "Machine Learning Competency Metrics",
      desc: "Our integrated background model automatically parses candidate experience documents, mapping key skills to pre-calculated parameters. This dynamically pre-fills manager evaluation dashboards to speed up HR reviews.",
      badge: "AI PRE-VALIDATION",
      details: [
        "Dynamic tag rendering of verified capabilities",
        "Pre-filled star score estimates based on attendance",
        "Detailed comments generation summarizing strengths"
      ],
      visual: (
        <div className="bg-white border border-slate-350 rounded-lg p-5 shadow-sm space-y-3 text-left">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 text-[10px] px-2 py-1 rounded font-bold border border-emerald-100">
            <Cpu className="h-3.5 w-3.5 animate-spin-slow" />
            <span>AI PRE-VALIDATED SKILLS REPORT</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['react', 'python', 'node.js', 'management'].map(skill => (
              <span key={skill} className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                ✓ {skill}
              </span>
            ))}
          </div>
          <div className="space-y-1.5 text-[10px] text-slate-650">
            <div className="flex justify-between">
              <span>Technical Skills Estimate:</span>
              <span className="font-bold text-slate-900">4/5 Stars</span>
            </div>
            <div className="flex justify-between">
              <span>Communication & Teamwork:</span>
              <span className="font-bold text-slate-900">5/5 Stars</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Instant QR Validation Code",
      subtitle: "One-Click Offline Lookup Link",
      desc: "Every certificate generated features an embedded high-resolution QR code configured with the public verification endpoint. Employers can instantly scan using mobile devices to fetch original on-chain data.",
      badge: "QR LOOKUP INTEGRATION",
      details: [
        "Embedded scan-to-verify link directly in PDF",
        "Instant matching against blockchain hash registry",
        "Responsive public verification page previews"
      ],
      visual: (
        <div className="bg-emerald-50 border border-emerald-250 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
          <div className="h-16 w-16 bg-white border-2 border-emerald-700 rounded p-1 flex items-center justify-center shadow">
            <div className="w-full h-full bg-emerald-800 rounded"></div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-900 block">SCAN TO VERIFY ORIGIN</span>
            <p className="text-[9px] text-emerald-800 font-mono">http://localhost:5173/verify/CP-9814</p>
          </div>
        </div>
      )
    },
    {
      title: "Coordinated Multi-Role Pipeline",
      subtitle: "Structured Workflow Queues",
      desc: "Establishes secure workspaces and dashboards linking Employee request submits, Admin forwarding checks, Evaluator ratings parameters, and Public verifiers under a single unified network.",
      badge: "HR COLLABORATION FLOW",
      details: [
        "Dedicated views for Employees, Admins, and Evaluators",
        "JWT protected authentication & role-based restrictions",
        "Transparent step tracking from upload to blockchain anchoring"
      ],
      visual: (
        <div className="bg-white border border-slate-350 rounded-lg p-5 shadow-sm space-y-2 text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Roles Structure</span>
          <div className="space-y-2">
            {[
              { role: 'HR Admin', desc: 'Forward queues & confirm PDF issue', color: 'bg-blue-50 text-blue-800 border-blue-100' },
              { role: 'Team Evaluator', desc: 'Pre-filled AI rating & decisions', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
              { role: 'Employee', desc: 'Submit letter scans & track status', color: 'bg-yellow-50 text-yellow-800 border-yellow-100' }
            ].map(r => (
              <div key={r.role} className={`border p-2 rounded flex items-center justify-between text-[10px] ${r.color}`}>
                <span className="font-bold">{r.role}</span>
                <span className="text-slate-700 font-semibold">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  // Auto advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  const handlePrev = () => {
    setActiveSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleNext = () => {
    setActiveSlide(prev => (prev + 1) % carouselSlides.length);
  };

  const faqs: FAQItem[] = [
    { 
      q: 'Is the certificate document stored on the blockchain?', 
      a: 'No. To ensure strict data privacy compliance (like GDPR) and control gas costs, only the cryptographic SHA-256 hash of the certificate PDF, the unique ID, and transaction timestamp are stored. The actual PDF remains secure in our databases and can be validated against the public ledger instantly.' 
    },
    { 
      q: 'How does the AI pre-validation work?', 
      a: 'When an employee uploads credentials (resumes, experience letters, certificates), our background analysis engine parses and indexes key skills, calculating attendance indexes and tenures. It proposes recommended ratings to help managers speed up evaluations without replacing human oversight.' 
    },
    { 
      q: 'Can third-party verifiers scan these certificates offline?', 
      a: 'Absolutely. Every experience certificate generated includes a security QR code. Scanning it directs public verifiers to our secure portal, checking the local document hash against the decentralized contract register on the blockchain automatically.' 
    },
    { 
      q: 'What network is used to anchor the transactions?', 
      a: 'CertifyPro is pre-configured to anchor hashes to the Polygon blockchain (currently using the Polygon Amoy testnet for local development). This guarantees highly secure, permanent, and cost-efficient transaction writes with instant confirmation times.' 
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Sleek Glassmorphic Navbar */}
      <header className="border-b border-slate-200 py-4 px-8 bg-white/95 backdrop-blur-md fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-sm transition-all duration-200">
        <div className="flex items-center space-x-2 text-emerald-700">
          <GraduationCap className="h-9 w-9 text-emerald-600" />
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">CertifyPro</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/verify" className="text-slate-700 hover:text-emerald-850 font-bold text-sm transition-colors">Verifier Portal</Link>
          <Link to="/login" className="text-slate-700 hover:text-emerald-855 font-bold text-sm transition-colors">Evaluator Portal</Link>
          <div className="h-4 w-px bg-slate-350"></div>
          <Link to="/register" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-5 rounded text-sm transition-all duration-150 shadow hover:shadow-md border border-emerald-800">
            Register Organization
          </Link>
        </nav>

        {/* Live operational node indicator */}
        <div className="flex items-center space-x-2 bg-emerald-100 border border-emerald-250 rounded-full px-3 py-1 shadow-sm shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-650"></span>
          </span>
          <span className="text-[10px] text-emerald-900 font-extrabold tracking-wide uppercase hidden sm:inline">Polygon Nodes Operational</span>
          <span className="text-[10px] text-emerald-900 font-extrabold tracking-wide uppercase sm:hidden">Online</span>
        </div>
      </header>

      {/* GRAND HERO: Centered Typography & Dynamic Particle Network */}
      <section className="relative pt-44 pb-32 px-6 bg-gradient-to-b from-emerald-50 via-white to-slate-100 border-b border-slate-200 overflow-hidden">
        <LiveNetworkBackground />
        
        {/* Visual ambient gradients */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-[10.5px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>Cryptographic Trust Infrastructure</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight"
          >
            Chain of Trust for Digital <br />
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-650 to-teal-800 bg-clip-text text-transparent font-black">Credential Integrity</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto font-semibold"
          >
            An enterprise verification ecosystem automating employee experience tracking, background AI skills parsing, and Polygon network immutable ledger anchoring.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto"
          >
            <Link to="/register" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-8 rounded text-sm transition-all duration-150 shadow-md hover:shadow-lg text-center border border-emerald-800">
              Register Organization
            </Link>
            <Link to="/verify" className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-350 font-bold py-3.5 px-8 rounded text-sm transition-all duration-150 shadow-sm text-center">
              Verify Certificate
            </Link>
          </motion.div>
        </div>

        {/* INTERACTIVE PLAYGROUND / SEARCH SANDBOX */}
        <div className="max-w-3xl mx-auto mt-20 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white border border-slate-300 rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-black text-slate-900">Interactive Ledger Query Sandbox</h3>
              <p className="text-xs text-slate-600 font-medium">Query the blockchain smart contract directly from this sandbox console.</p>
            </div>

            <div className="relative bg-slate-100 border border-slate-300 p-1.5 rounded-xl shadow-inner flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-500 ml-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Enter Document ID (e.g. CP-9812)" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-1 pr-3 py-2.5 text-sm bg-transparent outline-none text-slate-900 placeholder-slate-500 font-medium"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors shadow shrink-0 flex items-center gap-1.5"
              >
                {isSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>{isSearching ? 'Querying...' : 'Fetch Record'}</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-4 text-xs">
              <span className="text-slate-500 font-bold">Quick Sandbox Inputs:</span>
              {['CP-9812', 'CP-9813', 'CP-9814'].map(id => (
                <button 
                  key={id}
                  onClick={() => triggerQuickSample(id)}
                  className="bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-full font-mono font-bold transition-all text-[11px] shadow-sm"
                >
                  {id}
                </button>
              ))}
            </div>

            {/* Sandbox Results Animation container */}
            <AnimatePresence mode="wait">
              {isSearching && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 border border-dashed border-emerald-300 rounded-xl p-8 bg-emerald-50/40 text-center flex flex-col items-center justify-center space-y-4"
                >
                  <RefreshCw className="h-8 w-8 text-emerald-700 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-950 font-mono">Querying Blockchain Ledger...</p>
                    <p className="text-xs text-slate-600 font-mono">Connecting to Polygon Gateway RPC: http://127.0.0.1:8545</p>
                  </div>
                  <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-600"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2 }}
                    />
                  </div>
                </motion.div>
              )}

              {searchResult && !isSearching && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 bg-emerald-50 border border-emerald-300 rounded-xl p-5 md:p-6 space-y-4 shadow-sm text-left animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div className="flex items-center space-x-2 text-emerald-900 font-black text-xs uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4 text-emerald-700 animate-bounce" />
                      <span>Ledger Match Verified</span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-emerald-300">
                      ✓ Anchored
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500 font-bold">Candidate:</span>
                        <p className="font-bold text-slate-900 text-sm md:mt-0.5">{searchResult.candidate}</p>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500 font-bold">Role:</span>
                        <p className="font-bold text-slate-900 text-sm md:mt-0.5">{searchResult.role}</p>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500 font-bold">Issuer Org:</span>
                        <p className="font-extrabold text-slate-900 md:mt-0.5">{searchResult.issuer}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500 font-bold">Tenure:</span>
                        <p className="font-extrabold text-slate-900 md:mt-0.5">{searchResult.tenure}</p>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500 font-bold">Evaluation Rating:</span>
                        <p className="font-black text-emerald-800 text-sm md:mt-0.5">{searchResult.rating}</p>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500 font-bold">Verified Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {searchResult.skills.map((skill: string) => (
                            <span key={skill} className="bg-white border border-emerald-250 text-emerald-900 text-[9px] font-black px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-300 rounded p-3 text-[11px] font-mono space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-slate-500 text-[10px] pb-1 border-b border-slate-150">
                      <span className="font-bold">TRANSACTION METADATA</span>
                      <span className="font-bold">BLOCK #{searchResult.block}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-bold shrink-0">TX HASH:</span>
                      <span className="text-slate-800 font-bold truncate">{searchResult.hash}</span>
                      <button 
                        onClick={() => copyToClipboard(searchResult.hash)}
                        className="text-slate-500 hover:text-emerald-700 shrink-0"
                        title="Copy Tx Hash"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 animate-ping-once" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">TIMESTAMP:</span>
                      <span className="text-slate-800 font-semibold">{searchResult.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">GAS CONSUMPTION:</span>
                      <span className="text-emerald-850 font-extrabold">{searchResult.gasUsed} Wei</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {searchError && !isSearching && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 bg-red-50 border border-red-200 rounded-xl p-5 text-center flex flex-col items-center space-y-2 text-xs"
                >
                  <XCircle className="h-8 w-8 text-red-650" />
                  <p className="font-black text-red-950">Hash Match Failed</p>
                  <p className="text-slate-700 font-medium leading-relaxed">{searchError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Social Proof (SaaS Style Logo Row) */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-center text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">
            Trusted by modern software teams & HR administrators worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-90">
            <div className="flex items-center space-x-1.5 font-extrabold text-slate-700 text-sm">
              <Building className="h-4.5 w-4.5 text-slate-500" />
              <span>Rutuja's Software</span>
            </div>
            <div className="flex items-center space-x-1.5 font-extrabold text-slate-700 text-sm">
              <Building className="h-4.5 w-4.5 text-slate-500" />
              <span>Gaikwad Tech Corp</span>
            </div>
            <div className="flex items-center space-x-1.5 font-extrabold text-slate-700 text-sm">
              <Building className="h-4.5 w-4.5 text-slate-500" />
              <span>Ingale HR Solutions</span>
            </div>
            <div className="flex items-center space-x-1.5 font-extrabold text-slate-700 text-sm">
              <Award className="h-4.5 w-4.5 text-slate-500" />
              <span>Amoy Networks</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW BENTO GRID FEATURES SECTION */}
      <section className="py-24 px-8 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10.5px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              Bento Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Key Platform Pillars</h2>
            <p className="text-slate-650 text-sm leading-relaxed font-semibold">
              Tailored integrations coordinating high-speed performance benchmarks and decentralization parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1 (Large Bento) */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 md:p-8 flex flex-col justify-between md:col-span-2 shadow-md min-h-[300px] hover:shadow-lg transition-all text-left">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 mb-6 shrink-0 shadow-md">
                <Shield className="h-6 w-6 text-emerald-350" />
              </div>
              <div className="space-y-2">
                <span className="text-[10.5px] font-black text-emerald-350 uppercase tracking-widest block">Polygon Integration</span>
                <h3 className="text-2xl font-black">Smart Contract Anchoring</h3>
                <p className="text-slate-200 text-xs leading-relaxed max-w-md font-medium">
                  Anchors document fingerprint signatures directly to public smart contract registries. Once records are written on-chain, they remain immutable, making verification mathematically solid.
                </p>
              </div>
            </div>

            {/* Box 2 (Small Bento) */}
            <div className="bg-white border border-slate-300 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-emerald-700/50 transition-all text-left">
              <div className="h-12 w-12 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-800 mb-6 shrink-0 shadow-sm">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-widest block">Automated Parsing</span>
                <h3 className="text-lg font-black text-slate-900">AI Score Estimations</h3>
                <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                  Background models index candidates' resumes and letters, estimating performance metrics to pre-populate dashboards.
                </p>
              </div>
            </div>

            {/* Box 3 (Small Bento) */}
            <div className="bg-white border border-slate-300 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-emerald-700/50 transition-all text-left">
              <div className="h-12 w-12 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-850 mb-6 shrink-0 shadow-sm">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-widest block">Instant Scanner</span>
                <h3 className="text-lg font-black text-slate-900">Security QR Lookups</h3>
                <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                  Embeds encrypted QR routes in certificate PDF files. Third-party auditors can scan and query contract states instantly on mobile.
                </p>
              </div>
            </div>

            {/* Box 4 (Large Bento) */}
            <div className="bg-white border border-slate-300 rounded-2xl p-6 md:p-8 flex flex-col justify-between md:col-span-2 shadow-md hover:shadow-lg hover:border-emerald-700/50 transition-all text-left">
              <div className="h-12 w-12 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-800 mb-6 shrink-0 shadow-sm">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-widest block">Multi-Role Workspace</span>
                <h3 className="text-2xl font-black text-slate-900">Unified Coordination Pipelines</h3>
                <p className="text-slate-700 text-xs leading-relaxed max-w-md font-semibold">
                  Unique portals tailored to isolate specific functionalities. Employees upload files, HR managers forward evaluation lists, evaluators adjust grades, and verifiers validate origins.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2.5 py-0.5 rounded border border-blue-200 shadow-sm">HR ADMIN</span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded border border-emerald-200 shadow-sm">EVALUATOR MANAGER</span>
                  <span className="bg-yellow-100 text-yellow-900 text-[10px] font-black px-2.5 py-0.5 rounded border border-yellow-200 shadow-sm">EMPLOYEE</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Structured Pipeline Timeline Section */}
      <section className="py-24 px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Structured Pipeline Flow</h2>
            <p className="text-slate-650 text-sm leading-relaxed font-semibold">
              Automated workflow coordinating validations, manager approvals, and on-chain records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Submit Documents', desc: 'Employee uploads Aadhaar ID, resume, and experience letter details.' },
              { num: '02', title: 'AI Pre-validation', desc: 'Background parser identifies key skills and pre-calculates rating suggestions.' },
              { num: '03', title: 'Manager Evaluation', desc: 'HR validates technical performance scores and approves issuance.' },
              { num: '04', title: 'On-Chain Seal', desc: 'Document hash is permanently written to the blockchain registry.' },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-350 rounded-2xl p-6 shadow-md flex flex-col justify-between relative hover:border-emerald-700 hover:shadow-lg transition-all duration-150 text-left">
                <span className="text-4xl font-black text-emerald-850 opacity-20 font-mono block">{step.num}</span>
                <div className="mt-4">
                  <h3 className="font-extrabold text-slate-900 text-base">{step.title}</h3>
                  <p className="text-slate-700 text-xs leading-relaxed font-semibold mt-2">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Themed Carousel Section for Final Year Project Showcase */}
      <section className="py-24 px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="bg-emerald-100 border border-emerald-250 text-emerald-900 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Project Pillars Showcase
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">Platform Core Pillars</h2>
            <p className="text-slate-650 text-sm leading-relaxed font-semibold animate-pulse">
              Explore the critical technologies coordinating trust and automation inside CertifyPro.
            </p>
          </div>

          {/* Carousel Slider Card */}
          <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-8 lg:p-12 relative overflow-hidden max-w-4xl mx-auto min-h-[380px] flex flex-col justify-between">
            {/* Slide Header Indicator */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
              <span className="bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                {carouselSlides[activeSlide].badge}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                0{activeSlide + 1} / 0{carouselSlides.length}
              </span>
            </div>

            {/* Slide Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center flex-1">
              {/* Text Info */}
              <div className="md:col-span-7 space-y-4 text-left">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                  {carouselSlides[activeSlide].subtitle}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {carouselSlides[activeSlide].title}
                </h3>
                <p className="text-xs md:text-sm text-slate-650 font-semibold leading-relaxed">
                  {carouselSlides[activeSlide].desc}
                </p>
                <ul className="space-y-1.5 pt-2">
                  {carouselSlides[activeSlide].details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-center space-x-2 font-medium">
                      <span className="h-1.5 w-1.5 bg-emerald-700 rounded-full shrink-0"></span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Graphic/Visual Panel */}
              <div className="md:col-span-5 w-full">
                {carouselSlides[activeSlide].visual}
              </div>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-6">
              {/* Dot Indicators */}
              <div className="flex space-x-2">
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeSlide === idx ? 'w-6 bg-emerald-700' : 'w-2.5 bg-slate-350 hover:bg-slate-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 border border-slate-300 bg-white rounded-full text-slate-600 hover:text-emerald-700 hover:border-emerald-700 transition-colors shadow-sm"
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 border border-slate-300 bg-white rounded-full text-slate-600 hover:text-emerald-700 hover:border-emerald-700 transition-colors shadow-sm"
                  title="Next Slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-center px-8 w-full shadow-md">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-1">
            <p className="text-4xl font-black">100%</p>
            <p className="text-emerald-100 text-[10px] uppercase tracking-wider font-extrabold">Hash Authenticity</p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black">&lt; 1 Minute</p>
            <p className="text-emerald-100 text-[10px] uppercase tracking-wider font-extrabold">Query Turnaround</p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black">Zero</p>
            <p className="text-emerald-100 text-[10px] uppercase tracking-wider font-extrabold">Tampering Failures</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-slate-900 tracking-tight mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm transition-colors"
                >
                  <button 
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full py-4.5 px-6 flex items-center justify-between text-left text-sm md:text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-700 shrink-0 ml-4 animate-pulse" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-4" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50 text-left">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CONVERSION CTA BANNER */}
      <section className="py-20 px-8 bg-gradient-to-b from-slate-100 to-slate-250 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Ready to Anchor Your Experience Certificates?</h2>
          <p className="text-slate-700 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
            Join hundreds of forward-thinking organizations writing cryptographic proof tags directly to the blockchain ledger.
          </p>
          <div className="pt-2">
            <Link 
              to="/register" 
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-10 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-150 inline-flex items-center space-x-2"
            >
              <span>Create Free Enterprise Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-8 bg-white flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 mt-auto">
        <p>&copy; 2026 CertifyPro – Chain of Trust. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0 font-semibold text-slate-500">
          <Link to="/verify" className="hover:text-emerald-700">Verifier Portal</Link>
          <Link to="/login" className="hover:text-emerald-700">HR Sign In</Link>
        </div>
      </footer>
    </div>
  );
};
