'use client';

import { motion } from 'framer-motion';
import {
  Eye,
  Printer,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Info,
  CheckCircle,
  MessageCircle,
  ArrowUp,
  Loader2
} from 'lucide-react';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

const reportNavLinks = [
  { label: 'Dashboard', href: '#' },
  { label: 'Reports', href: '#' },
  { label: 'Scans', href: '#' },
];

const severityConfig: Record<string, any> = {
  critical: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-700',
    severityBg: 'bg-red-700',
    Icon: ShieldAlert,
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    severityBg: 'bg-amber-500',
    Icon: ShieldCheck,
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    severityBg: 'bg-blue-600',
    Icon: Info,
  },
  good: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    severityBg: 'bg-green-600',
    Icon: CheckCircle,
  },
};

export default function ReportPage() {
  const params = useParams();
  const scanId = params.scanId as string;

  const { data, isLoading } = useQuery({
    queryKey: ['scanResults', scanId],
    queryFn: async () => {
      const res = await fetch(`/api/scan/${scanId}/results`);
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    }
  });

  if (isLoading || !data) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-surface">
         <Loader2 className="animate-spin text-slate-800" size={40} />
       </div>
    );
  }

  const { scan, findings } = data;
  const criticalCount = findings.filter((f: any) => f.severity === 'critical').length;
  const warningCount = findings.filter((f: any) => f.severity === 'warning').length;
  
  let summary = `The automated security diagnostic for ${scan.url} has concluded with an overall security grade of "${scan.grade}". `;
  if (criticalCount > 0) {
    summary += `We identified ${criticalCount} critical vulnerabilities that require immediate remediation to prevent potential compromise. `;
  } else if (warningCount > 0) {
    summary += `While core systems appear secure, there are ${warningCount} warnings related to best practices that should be addressed. `;
  } else {
    summary += `The target exhibits a strong security posture with no major vulnerabilities detected. `;
  }

  return (
    <>
      <div className="no-print">
        <TopNav
          activeLink="Reports"
          navLinks={reportNavLinks}
          ctaLabel="Download PDF"
        />
      </div>

      <main className="min-h-screen py-12 px-4 md:px-0 flex flex-col items-center bg-surface">
        {/* Document Toolbar */}
        <div className="max-w-[850px] w-full mb-8 flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-primary" />
            <span className="font-mono text-xs font-semibold text-on-surface-variant">
              PREVIEW MODE: PUBLIC REPORT
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded hover:bg-surface-container-high transition-all font-mono text-xs font-semibold text-on-surface"
            >
              <Printer size={16} />
              PRINT
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded hover:bg-surface-container-high transition-all font-mono text-xs font-semibold text-on-surface">
              <Share2 size={16} />
              SHARE LINK
            </button>
          </div>
        </div>

        {/* PDF Report Canvas (Light Theme) */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="report-canvas max-w-[850px] w-full min-h-[1100px] p-12 md:p-16 flex flex-col rounded-lg bg-white"
        >
          {/* Report Header */}
          <header className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 font-inter text-3xl font-bold tracking-tight">
                SiteAudit Security Report
              </h1>
              <p className="text-slate-500 flex items-center gap-2">
                <span className="font-bold text-slate-700">TARGET:</span>
                <span className="font-mono text-sm break-all">{scan.url}</span>
              </p>
              <p className="text-slate-400 text-sm">
                Generated on {new Date(scan.created_at).toLocaleDateString()} • ID: #{scan.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            {/* Grade Badge */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-lg bg-slate-900 flex items-center justify-center border-2 border-slate-900">
                <span className="text-white text-5xl font-bold">{scan.grade || 'A'}</span>
              </div>
              <span className="mt-2 font-mono text-slate-700 uppercase tracking-widest text-[10px]">
                Overall Grade
              </span>
            </div>
          </header>

          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-4 border-l-4 border-slate-900 pl-3">
              Executive Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {summary}
            </p>
          </section>

          {/* Security Findings */}
          <section className="flex-grow">
            <h2 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-6 border-l-4 border-slate-900 pl-3">
              Security Findings
            </h2>
            <div className="space-y-6">
              {findings.map((finding: any) => {
                const config = severityConfig[finding.severity] || severityConfig.info;
                const Icon = config.Icon;
                return (
                  <div
                    key={finding.id}
                    className="p-6 border border-slate-200 rounded-lg flex gap-6 items-start hover:bg-slate-50 transition-colors"
                  >
                    <div className={`${config.iconBg} ${config.iconColor} p-3 rounded shrink-0`}>
                      <Icon size={22} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1 gap-4">
                        <h3 className="font-bold text-slate-900 text-lg truncate">{finding.title}</h3>
                        <span
                          className={`${config.severityBg} text-white font-mono px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0`}
                        >
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[15px] mb-3">{finding.description}</p>
                      {finding.evidence && (
                        <div className="bg-slate-100 p-3 rounded font-mono text-[13px] text-slate-800 overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(finding.evidence, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Report Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-slate-900 font-bold text-base">Want this fixed?</p>
              <p className="text-slate-500 text-sm">
                Contact the security team for a professional consultation.
              </p>
            </div>
            <a
              href="mailto:security@siteaudit.io"
              className="bg-slate-900 text-white px-6 py-3 rounded font-bold text-sm hover:bg-slate-800 transition-all no-print"
            >
              Contact Support
            </a>
          </footer>

          <div className="mt-8 text-center">
            <p className="text-slate-300 font-mono text-[10px] uppercase tracking-widest">
              © {new Date().getFullYear()} SiteAudit Security. Professional diagnostic environment.
            </p>
          </div>
        </motion.article>

        {/* Floating Controls */}
        <div className="fixed right-8 bottom-8 flex flex-col gap-3 no-print">
          <button className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
            <MessageCircle size={22} />
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 bg-surface-container-high text-primary rounded-full flex items-center justify-center shadow-xl border border-outline-variant hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowUp size={22} />
          </button>
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
