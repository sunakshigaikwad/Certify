import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, CheckCircle, Search, Cpu, CheckSquare, Database, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
      
      // Draw connecting lines (soft emerald green)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 0.9;
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
      ctx.fillStyle = 'rgba(4, 120, 87, 0.35)';
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

export const LandingPage: React.FC = () => {
  // Simulate blockchain anchoring logs
  const [liveBlocks, setLiveBlocks] = useState<any[]>([
    { id: 'CP-9812', hash: '0x3a4b...7f1a', candidate: 'A. Gangurde', status: 'SUCCESS' },
    { id: 'CP-9813', hash: '0x6e2c...9d3e', candidate: 'S. Gaikwad', status: 'SUCCESS' },
    { id: 'CP-9814', hash: '0xf8a1...2b8c', candidate: 'R. Ingale', status: 'SUCCESS' },
  ]);

  // Carousel Active Slide State
  const [activeSlide, setActiveSlide] = useState(0);

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
        <div className="bg-gray-900 text-emerald-400 p-5 rounded-lg border border-gray-800 font-mono text-[11px] space-y-2.5 shadow-md">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-[10px] text-gray-500">
            <span>[POLYGON AMOY TESTNET REGISTER]</span>
            <span className="text-emerald-500 animate-pulse">● LIVE CONNECTION</span>
          </div>
          <p className="text-gray-400">&gt;&gt; Anchoring Document ID: CP-9814</p>
          <p className="break-all">&gt;&gt; File Hash: 0xa8f2b3e401c23f8702b8d91a3b5c4e78aef291bc82d039fa8e7162985123d4cf</p>
          <p className="text-emerald-500">&gt;&gt; STATUS: HASH ANCHORED SUCCESSFULLY IN BLOCK #8491823</p>
          <p className="text-gray-400">&gt;&gt; Tx Receipt: 0x9f8e12b7a3...4e9d</p>
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
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 text-[10px] px-2 py-1 rounded font-bold border border-emerald-100">
            <Cpu className="h-3.5 w-3.5" />
            <span>AI PRE-VALIDATED SKILLS REPORT</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['react', 'python', 'node.js', 'management'].map(skill => (
              <span key={skill} className="bg-emerald-50 border border-emerald-150 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded">
                ✓ {skill}
              </span>
            ))}
          </div>
          <div className="space-y-1.5 text-[10px] text-gray-600">
            <div className="flex justify-between">
              <span>Technical Skills Estimate:</span>
              <span className="font-bold text-gray-900">4/5 Stars</span>
            </div>
            <div className="flex justify-between">
              <span>Communication & Teamwork:</span>
              <span className="font-bold text-gray-900">5/5 Stars</span>
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
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
          <div className="h-16 w-16 bg-white border-2 border-emerald-700 rounded p-1 flex items-center justify-center shadow">
            <div className="w-full h-full bg-emerald-800 rounded"></div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-900 block">SCAN TO VERIFY ORIGIN</span>
            <p className="text-[9px] text-emerald-700 font-mono">http://localhost:5173/verify/CP-9814</p>
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
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Workspace Roles Structure</span>
          <div className="space-y-2">
            {[
              { role: 'HR Admin', desc: 'Forward queues & confirm PDF issue', color: 'bg-blue-50 text-blue-800 border-blue-100' },
              { role: 'Team Evaluator', desc: 'Pre-filled AI rating & decisions', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
              { role: 'Employee', desc: 'Submit letter scans & track status', color: 'bg-yellow-50 text-yellow-800 border-yellow-100' }
            ].map(r => (
              <div key={r.role} className={`border p-2 rounded flex items-center justify-between text-[10px] ${r.color}`}>
                <span className="font-bold">{r.role}</span>
                <span className="text-gray-500 font-medium">{r.desc}</span>
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
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleNext = () => {
    setActiveSlide(prev => (prev + 1) % carouselSlides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const candidates = ['S. Zodage', 'A. Dhiwar', 'J. Doe', 'M. Smith'];
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      const randomId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomHash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
      
      setLiveBlocks(prev => [
        { id: randomId, hash: randomHash, candidate: randomCandidate, status: 'SUCCESS' },
        ...prev.slice(0, 2)
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="border-b border-gray-200/80 py-4 px-8 bg-white fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 text-emerald-700">
          <GraduationCap className="h-9 w-9" />
          <span className="text-2xl font-bold tracking-tight">CertifyPro</span>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/verify" className="text-gray-600 hover:text-emerald-700 font-semibold text-sm transition-colors">Verify Certificate</Link>
          <Link to="/login" className="text-gray-600 hover:text-emerald-700 font-semibold text-sm transition-colors">Sign In</Link>
          <Link to="/register" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-5 rounded text-sm transition-all duration-150 shadow hover:shadow-md border border-emerald-800">
            Register Organization
          </Link>
        </nav>
      </header>

      {/* UPGRADED HERO: Modern Light-Theme Mint-Slate Gradient with live flowing node canvas */}
      <section className="pt-40 pb-28 px-8 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-100 border-b border-gray-250 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1.2px,transparent_1.2px)] [background-size:24px_24px]">
        {/* Live flowing node network animation */}
        <LiveNetworkBackground />
        
        {/* Soft background glows matching light theme */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text Column - Glowing Gradient title */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center space-x-1.5 bg-white border border-emerald-200/80 text-emerald-800 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Decentralized Ledger Cryptography</span>
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-950 leading-tight tracking-tight">
              Chain of Trust - <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 bg-clip-text text-transparent font-black">Secure and Transparent</span> Digital Certificate Verification using Blockchain
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
              A state-of-the-art solution automating experience certificate requests, background AI skill evaluations, PDF creation, and Polygon network immutable anchoring.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 px-8 rounded text-sm transition-all duration-150 shadow-md hover:shadow-lg text-center border border-emerald-800">
                Register as Employee
              </Link>
              <Link to="/verify" className="bg-white/90 hover:bg-white text-gray-700 border border-gray-300 font-semibold py-3.5 px-8 rounded text-sm transition-all duration-150 shadow-sm hover:shadow text-center">
                Verify Certificate ID
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Mock Certificate & Blockchain Status Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Certificate Mockup */}
            <div className="bg-white/95 backdrop-blur border-2 border-emerald-700/80 rounded-lg p-5 shadow-lg relative overflow-hidden aspect-[1.414/1] scale-95 hover:scale-100 transition-transform duration-300">
              <div className="h-6 bg-emerald-700 text-white text-[7px] font-bold flex items-center justify-between px-3 rounded-sm">
                <span>CertifyPro — Chain of Trust</span>
                <span>RUTUJA'S SOFTWARE PVT LTD</span>
              </div>
              <div className="text-center pt-3 space-y-2">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-widest block">Certificate of Experience</span>
                <span className="text-[6px] text-gray-400 block">This is proudly presented to</span>
                <span className="text-[12px] font-bold text-gray-900 border-b border-gray-150 pb-0.5 px-4 inline-block">aksha dhiwar</span>
                <p className="text-[6px] text-gray-500 max-w-[220px] mx-auto leading-relaxed">
                  For their contributions as Software Engineer during the tenure from jan 2023 - dec 2025 with an attendance rate of 83%.
                </p>
                <div className="text-[7px] text-emerald-800 font-bold tracking-wide uppercase pt-1">
                  Verified Skills: react  •  python  •  node.js
                </div>
              </div>
              
              {/* QR and Signatures */}
              <div className="flex justify-between items-center px-4 pt-3 border-t border-gray-100 mt-2">
                <div className="text-[5px] text-gray-400 text-left border-t border-gray-200 pt-0.5 w-16">
                  <strong>Authorized Signer</strong>
                </div>
                <div className="h-8 w-8 bg-emerald-50 border border-emerald-200 rounded p-0.5 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-emerald-700/80 rounded-sm"></div>
                </div>
                <div className="text-[5px] text-gray-400 text-center border-t border-gray-200 pt-0.5 w-16">
                  <strong>Blockchain Registry</strong>
                </div>
              </div>

              <div className="absolute bottom-2 left-3 text-[5px] text-gray-400 font-mono">
                ID: CP-9814-SEED
              </div>
              <div className="absolute bottom-2 right-3 bg-emerald-100 text-emerald-800 text-[5px] font-extrabold border border-emerald-200 rounded px-1 py-0.2">
                ✓ BLOCKCHAIN VERIFIED
              </div>
            </div>

            {/* Live Audit Log widget */}
            <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-lg p-5 shadow-md space-y-3 scale-95">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                  <Database className="h-4 w-4" />
                  <span>Real-Time Ledger Audit Feed</span>
                </div>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
              </div>
              <div className="space-y-2">
                {liveBlocks.map((block, idx) => (
                  <div key={block.id + idx} className="bg-white border border-gray-150 rounded p-2.5 flex items-center justify-between text-[11px] hover:border-emerald-700 shadow-sm transition-colors">
                    <div>
                      <span className="font-bold text-gray-800">{block.id}</span>
                      <p className="text-[9px] text-gray-400 font-mono">Tx Hash: {block.hash}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-700 block font-semibold">{block.candidate}</span>
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        ✓ Anchored
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Timeline Section */}
      <section className="py-24 px-8 bg-gray-50 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Structured Pipeline Flow</h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
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
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between relative hover:border-emerald-700 hover:shadow-md transition-all duration-150">
                <span className="text-4xl font-black text-emerald-100 font-mono block">{step.num}</span>
                <div className="mt-4">
                  <h3 className="font-bold text-gray-950 text-base">{step.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mt-2">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Themed Carousel Section for Final Year Project Showcase */}
      <section className="py-24 px-8 bg-white border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Project Pillars Showcase
            </span>
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight mt-3">Platform Core Pillars</h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Explore the critical technologies coordinating trust and automation inside CertifyPro.
            </p>
          </div>

          {/* Carousel Slider Card */}
          <div className="bg-gray-50 border border-gray-250 rounded-xl shadow-md p-8 lg:p-12 relative overflow-hidden max-w-4xl mx-auto min-h-[380px] flex flex-col justify-between">
            {/* Slide Header Indicator */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <span className="bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                {carouselSlides[activeSlide].badge}
              </span>
              <span className="text-xs font-mono font-bold text-gray-400">
                0{activeSlide + 1} / 0{carouselSlides.length}
              </span>
            </div>

            {/* Slide Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center flex-1">
              {/* Text Info */}
              <div className="md:col-span-7 space-y-4 text-left">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block">
                  {carouselSlides[activeSlide].subtitle}
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug">
                  {carouselSlides[activeSlide].title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  {carouselSlides[activeSlide].desc}
                </p>
                <ul className="space-y-1.5 pt-2">
                  {carouselSlides[activeSlide].details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-center space-x-2">
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
            <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-6">
              {/* Dot Indicators */}
              <div className="flex space-x-2">
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeSlide === idx ? 'w-6 bg-emerald-700' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 border border-gray-300 bg-white rounded-full text-gray-600 hover:text-emerald-700 hover:border-emerald-700 transition-colors shadow-sm"
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 border border-gray-300 bg-white rounded-full text-gray-600 hover:text-emerald-700 hover:border-emerald-700 transition-colors shadow-sm"
                  title="Next Slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with left icons */}
      <section className="py-24 px-8 bg-white border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Key Technological Features</h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Every system utility is tailored to guarantee authenticity, speed, and structural integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Smart Contract Anchoring', desc: 'Locks certificate document SHA-256 fingerprint hashes on Polygon testnet blocks for immutable verifications.' },
              { icon: Cpu, title: 'Intelligent AI Metrics', desc: 'Pre-fills scores across Technical capability, Teamwork, and Punctuality parameters using system models.' },
              { icon: Search, title: 'Embedded QR Scans', desc: 'Generates emerald verification QR codes on issued PDFs, linking directly to verification pages.' },
              { icon: CheckSquare, title: 'Comprehensive Dashboards', desc: 'Unique workflows tailored for Employee, HR Admin, and Team Manager Evaluators.' },
              { icon: CheckSquare, title: 'Landscape A4 Design', desc: 'Prints corporate-ready experience templates containing validated skill badges and digital signatures.' },
              { icon: CheckSquare, title: 'Audit Chronology Log', desc: 'Logs actions on local SQLite databases to trace verification transitions securely.' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-emerald-700/80 transition-all duration-150">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-950 text-base">{item.title}</h3>
                  <p className="text-gray-600 text-xs mt-2 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-emerald-800 text-white text-center px-8 w-full shadow-inner">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="text-4xl font-black">100%</p>
            <p className="text-emerald-100 text-xs mt-1.5 uppercase tracking-wider font-semibold">Verification Authenticity</p>
          </div>
          <div>
            <p className="text-4xl font-black">&lt; 1 Minute</p>
            <p className="text-emerald-100 text-xs mt-1.5 uppercase tracking-wider font-semibold">Evaluation Turnaround</p>
          </div>
          <div>
            <p className="text-4xl font-black">0</p>
            <p className="text-emerald-100 text-xs mt-1.5 uppercase tracking-wider font-semibold">Counterfeit Document Vulnerabilities</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-8 max-w-3xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-center text-gray-950 tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-6 mt-12">
          {[
            { q: 'Is the certificate document stored on the blockchain?', a: 'No. To ensure confidentiality and privacy compliance, only the SHA-256 hash of the PDF certificate, the unique ID, and timestamp are written on-chain.' },
            { q: 'How does AI pre-validation operate?', a: 'When the Admin forwards the request, AI evaluates the skills and attendance parameters, proposing pre-filled ratings to assist the final human evaluator.' },
            { q: 'What is the role of the Public Verifier?', a: 'A public verifier can search the database by Certificate ID or scan the QR code to review the cryptographic proof, proving the certificate matches the recorded block hash.' }
          ].map((item, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-6">
              <h4 className="font-bold text-gray-950 text-base">{item.q}</h4>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-8 bg-gray-50 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 mt-auto shadow-sm">
        <p>&copy; 2026 CertifyPro – Chain of Trust. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0 font-semibold">
          <Link to="/verify" className="hover:text-emerald-700">Verifier Portal</Link>
          <Link to="/login" className="hover:text-emerald-700">HR Sign In</Link>
        </div>
      </footer>
    </div>
  );
};
