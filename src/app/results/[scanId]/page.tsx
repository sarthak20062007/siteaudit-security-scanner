'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  HeadsetIcon,
  Search,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  Code,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import TopNav, { dashboardLinks } from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const severityConfig: Record<string, any> = {
  critical: {
    bg: 'bg-error-container/20',
    border: 'border-error/30',
    text: 'text-error',
    badgeBg: 'bg-error-container',
    badgeText: 'text-on-error-container',
    label: 'Critical',
    Icon: AlertTriangle,
  },
  warning: {
    bg: 'bg-tertiary-container/20',
    border: 'border-tertiary-fixed-dim/30',
    text: 'text-tertiary-fixed-dim',
    badgeBg: 'bg-tertiary-container/10',
    badgeText: 'text-tertiary-container',
    label: 'Warning',
    Icon: ShieldCheck,
  },
  info: {
    bg: 'bg-surface-container-high/50',
    border: 'border-outline-variant',
    text: 'text-on-surface-variant',
    badgeBg: 'bg-surface-container-high',
    badgeText: 'text-on-surface-variant',
    label: 'Info',
    Icon: Search,
  },
  good: {
    bg: 'bg-primary-container/10',
    border: 'border-primary/20',
    text: 'text-primary-fixed-dim',
    badgeBg: 'bg-primary-container/10',
    badgeText: 'text-primary',
    label: 'Good',
    Icon: CheckCircle,
  },
};

const leadSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  message: z.string().optional(),
});

export default function ResultsPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['scanResults', scanId],
    queryFn: async () => {
      const res = await fetch(`/api/scan/${scanId}/results`);
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    }
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: { email: '', message: '' }
  });

  const onSubmitLead = async (formData: any) => {
    try {
      const res = await fetch(`/api/scan/${scanId}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) setLeadSuccess(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
         <Loader2 className="animate-spin text-primary" size={40} />
       </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest text-center p-6">
        <AlertTriangle className="text-error mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2 text-on-surface">Failed to load results</h2>
        <p className="text-on-surface-variant max-w-md">{error instanceof Error ? error.message : 'Unknown error occurred.'}</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-primary-container text-on-primary-container rounded-full hover:brightness-110">
          Try Again
        </Link>
      </div>
    );
  }

  const findings = data.findings || [];
  const scan = data.scan;
  const criticalCount = findings.filter((f: any) => f.severity === 'critical').length;
  const warningCount = findings.filter((f: any) => f.severity === 'warning').length;
  const infoCount = findings.filter((f: any) => f.severity === 'info').length;
  const goodCount = findings.filter((f: any) => f.severity === 'good').length;

  return (
    <>
      <TopNav activeLink="Security Scans" navLinks={dashboardLinks} />
      <div className="flex min-h-[calc(100vh-65px)]">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-[280px] p-6 md:p-12 overflow-y-auto">
          {/* Grade Section */}
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto mb-16 flex flex-col items-center text-center"
          >
            <div className="relative mb-8 group">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-tertiary-container animate-[spin_10s_linear_infinite] opacity-30" />
              <div className="w-48 h-48 rounded-full bg-surface-container border-4 border-tertiary-container flex items-center justify-center b-grade-glow relative z-10">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-[120px] font-black text-tertiary-container leading-none select-none"
                >
                  {scan.grade || 'A'}
                </motion.span>
              </div>
            </div>
            <h1 className="font-inter text-3xl font-bold tracking-tight mb-2">
              Scan Analysis Complete
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Analysis performed on{' '}
              <code className="bg-surface-container px-2 py-1 rounded text-primary text-sm break-all">
                {scan.url}
              </code>
            </p>

            {/* Action Row */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 sticky top-24 z-40 bg-surface-container-lowest/80 backdrop-blur-md py-4 px-8 rounded-full border border-outline-variant/30 shadow-2xl">
              <a 
                href={`/api/scan/${scanId}/pdf`} 
                download
                className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold flex items-center gap-2 primary-glow hover:scale-105 transition-transform active:scale-95"
              >
                <Download size={18} />
                Download PDF Report
              </a>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-surface-variant border border-outline-variant text-on-surface px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-outline-variant transition-colors active:scale-95"
              >
                <HeadsetIcon size={18} />
                Get Help Fixing This
              </button>
            </div>
          </motion.section>

          {/* Findings Section */}
          <section className="max-w-5xl mx-auto space-y-6 pb-24">
            <div className="flex items-center justify-between px-4 mb-4 flex-wrap gap-4">
              <h2 className="font-inter text-xl font-semibold text-on-surface-variant flex items-center gap-3">
                <Search size={20} />
                Detection Logs
              </h2>
              <div className="flex gap-2 flex-wrap">
                {criticalCount > 0 && (
                  <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-error-container text-on-error-container">
                    {criticalCount} Critical
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container">
                    {warningCount} Warning
                  </span>
                )}
                {infoCount > 0 && (
                  <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                    {infoCount} Info
                  </span>
                )}
                {goodCount > 0 && (
                   <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-primary-container/20 text-primary-fixed-dim">
                    {goodCount} Good
                  </span>
                )}
              </div>
            </div>

            {findings.map((finding: any, i: number) => {
              const config = severityConfig[finding.severity] || severityConfig.info;
              const SeverityIcon = config.Icon;
              return (
                <Link key={finding.id} href={`/finding/${finding.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    className={`bg-surface-container border border-outline-variant rounded-xl overflow-hidden finding-card transition-all cursor-pointer group mb-6 ${
                      finding.severity === 'good' ? 'opacity-80 hover:opacity-100' : ''
                    }`}
                  >
                    <div className="p-6 flex items-start gap-5">
                      <div
                        className={`w-12 h-12 rounded-lg shrink-0 ${config.bg} border ${config.border} flex items-center justify-center ${config.text}`}
                      >
                        <SeverityIcon size={22} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-4">
                          <h3 className="font-inter text-xl font-semibold text-on-surface truncate">
                            {finding.title}
                          </h3>
                          <span
                            className={`shrink-0 font-mono text-sm font-medium uppercase tracking-tighter ${config.badgeText} px-3 py-1 ${config.badgeBg} rounded border ${config.border}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-on-surface-variant mb-4">{finding.description}</p>
                        {finding.evidence && (
                          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 font-mono text-sm font-medium overflow-x-auto">
                            <div className="text-on-surface-variant flex items-center gap-2 mb-2">
                              <Code size={14} />
                              Evidence:
                            </div>
                            <pre className="text-on-surface break-all whitespace-pre-wrap">{JSON.stringify(finding.evidence, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-on-surface-variant mt-2 shrink-0 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </section>
        </main>
      </div>
      <Footer />

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container rounded-2xl border border-outline-variant p-8 max-w-md w-full relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              >
                <X size={24} />
              </button>
              
              {leadSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-fixed-dim">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-on-surface-variant">We'll be in touch shortly to help you secure your site.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2">Need Expert Help?</h3>
                  <p className="text-on-surface-variant mb-6">Enter your details and our security engineers will reach out to help fix these vulnerabilities.</p>
                  
                  <form onSubmit={handleSubmit(onSubmitLead)} className="space-y-4">
                    <div>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="Your Email Address"
                        className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded border border-outline-variant focus:border-primary-container focus:outline-none"
                      />
                      {errors.email && <p className="text-error text-sm mt-1">{errors.email.message as string}</p>}
                    </div>
                    <div>
                      <textarea
                        {...register('message')}
                        placeholder="Any specific concerns? (Optional)"
                        rows={3}
                        className="w-full bg-surface-container-low text-on-surface px-4 py-3 rounded border border-outline-variant focus:border-primary-container focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary-container text-on-primary-container py-3 rounded font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                      Request Assistance
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
