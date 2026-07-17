'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { LockOpen, CheckCircle, ShieldCheck, Cpu, Ban, Wifi, Lock } from 'lucide-react';
import TopNav, { dashboardLinks } from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

interface Check {
  id: string;
  label: string;
  resultLabel: string;
  delay: number;
  icon: React.ElementType;
}

const checks: Check[] = [
  { id: 'ssl', label: 'SSL Certificate', resultLabel: 'SECURE', delay: 1500, icon: Lock },
  { id: 'headers', label: 'Security Headers', resultLabel: 'VERIFIED', delay: 3500, icon: ShieldCheck },
  { id: 'dns', label: 'DNS Records', resultLabel: 'STABLE', delay: 5500, icon: Wifi },
  { id: 'cms', label: 'CMS Detection', resultLabel: 'DETECTED', delay: 7500, icon: Cpu },
  { id: 'blacklist', label: 'Blacklist Status', resultLabel: 'CLEAN', delay: 9000, icon: Ban },
];

const logEntries = [
  'fetching x.509 certificate headers...',
  'analyzing CSP and HSTS policies...',
  'querying global DNS propagates...',
  'running fingerprinting on tech stack...',
  'checking 42 global threat databases...',
];

export default function ScanningPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.scanId as string;

  const [progress, setProgress] = useState(0);
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<string[]>([
    '> initializing secure socket tunnel...',
    '> bypass_handshake sequence confirmed.',
  ]);
  const progressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Start the scan run
  useEffect(() => {
    if (scanId) {
      fetch(`/api/scan/${scanId}/run`).catch(console.error);
    }
  }, [scanId]);

  // Poll for status
  const { data: statusData } = useQuery({
    queryKey: ['scanStatus', scanId],
    queryFn: async () => {
      const res = await fetch(`/api/scan/${scanId}/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      console.log('Polling status:', status, query.state.data);
      return (status === 'complete' || status === 'error') ? false : 1500;
    },
  });

  console.log('Current statusData in render:', statusData);

  // Redirect when complete
  useEffect(() => {
    if (statusData?.status === 'complete' || statusData?.status === 'error') {
       // Briefly show 100% before redirect
       setProgress(100);
       setTimeout(() => {
         router.push(`/results/${scanId}`);
       }, 1000);
    }
  }, [statusData, router, scanId]);

  // Animate progress
  useEffect(() => {
    const updateProgress = () => {
      if (progressRef.current < 100) {
        progressRef.current += Math.random() * 2;
        if (progressRef.current > 100) progressRef.current = 100;
        setProgress(Math.floor(progressRef.current));
        animFrameRef.current = requestAnimationFrame(() => {
          setTimeout(updateProgress, 100);
        });
      }
    };
    updateProgress();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Animate check completions
  useEffect(() => {
    const timers = checks.map((check, index) =>
      setTimeout(() => {
        setCompletedChecks((prev) => new Set(prev).add(check.id));
        setLogs((prev) => [`> ${logEntries[index]} [OK]`, ...prev]);
      }, check.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const dashArray = 364.4;
  const dashOffset = dashArray - (progress / 100) * dashArray;

  return (
    <>
      <TopNav activeLink="Security Scans" navLinks={dashboardLinks} />
      <Sidebar />

      <main className="lg:ml-[280px] min-h-[calc(100vh-65px)] relative flex flex-col items-center justify-center p-6">
        {/* Scanning gradient background */}
        <div className="absolute inset-0 scanning-gradient pointer-events-none opacity-20" />

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          {/* Target Info */}
          <div className="mb-12 text-center">
            <span className="font-mono text-xs font-semibold text-primary-fixed-dim bg-surface-container-high px-4 py-1 rounded-full border border-outline-variant mb-4 inline-block uppercase tracking-wider">
              Scanning Target: HTTPS://CORE-ACCESS.SECURITY.DB
            </span>
            <h1 className="font-inter text-3xl font-bold text-on-surface mt-2 tracking-tight">
              Active Vulnerability Audit
            </h1>
            <p className="text-on-surface-variant mt-2 text-base">
              Diagnostic engine initiated. Establishing secure handshake...
            </p>
          </div>

          {/* Central Animated Ring */}
          <div className="relative flex items-center justify-center mb-16">
            {/* Outer Pulse Rings */}
            <div className="absolute w-48 h-48 border border-primary/20 rounded-full scanner-ring" />
            <div
              className="absolute w-64 h-64 border border-primary/10 rounded-full scanner-ring"
              style={{ animationDelay: '0.5s' }}
            />

            {/* Main Core */}
            <div className="relative w-40 h-40 rounded-full bg-surface-container border-2 border-outline-variant flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,219,231,0.1)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-surface-variant"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="text-primary-container transition-all duration-1000 ease-linear"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="58"
                    stroke="currentColor"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
              </div>
              <div className="text-center z-10">
                <span className="font-mono text-xl font-semibold text-primary-fixed-dim glow-cyan">
                  {progress}%
                </span>
                <p className="font-mono text-[10px] font-semibold text-on-surface-variant uppercase tracking-tighter">
                  Analyzing
                </p>
              </div>
            </div>
          </div>

          {/* Checklist Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {checks.map((check) => {
              const isComplete = completedChecks.has(check.id);
              const Icon = check.icon;
              return (
                <motion.div
                  key={check.id}
                  layout
                  className={`check-item flex items-center justify-between p-4 rounded border bg-surface-container-low ${
                    isComplete
                      ? 'active border-primary/50'
                      : 'border-outline-variant'
                  } ${check.id === 'blacklist' ? 'md:col-span-2' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                      {isComplete ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary-container glow-cyan"
                        >
                          <CheckCircle size={20} fill="currentColor" />
                        </motion.div>
                      ) : (
                        <motion.div key="pending" className="text-outline">
                          <Icon size={20} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className="font-mono text-sm font-medium">{check.label}</span>
                  </div>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isComplete
                        ? 'text-primary-fixed-dim font-bold'
                        : 'text-on-surface-variant opacity-50'
                    }`}
                  >
                    {isComplete ? check.resultLabel : 'PENDING'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Terminal-style Log */}
          <div className="mt-12 w-full bg-surface-container-lowest p-4 rounded border border-outline-variant border-dashed opacity-70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-medium text-on-surface-variant uppercase tracking-widest">
                System Logs
              </span>
              <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse" />
            </div>
            <div className="space-y-1 font-mono text-[11px] text-on-surface-variant/80 max-h-32 overflow-y-auto">
              {logs.map((log, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={log.includes('[OK]') ? 'text-primary-fixed-dim' : ''}
                >
                  {log}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer withSidebarOffset />
    </>
  );
}
