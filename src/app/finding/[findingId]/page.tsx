'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Wand2,
  Globe,
  ShieldAlert,
  Shield,
  EyeOff,
  Info,
  Copy,
  Loader2,
  ShieldCheck,
  Search,
  CheckCircle,
} from 'lucide-react';
import TopNav, { dashboardLinks } from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { findingsContent } from '@/lib/findings-content';

const severityConfig: Record<string, any> = {
  critical: {
    bg: 'bg-error-container/20',
    border: 'border-error/30',
    text: 'text-error',
    badgeBg: 'bg-error-container',
    badgeText: 'text-on-error-container',
    label: 'Critical Severity',
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

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const findingId = params.findingId as string;

  const { data, isLoading } = useQuery({
    queryKey: ['finding', findingId],
    queryFn: async () => {
      // Fetch finding and join with scan url
      const { data: findingData, error: findingError } = await supabase
        .from('findings')
        .select(`
          *,
          scans (
            url
          )
        `)
        .eq('id', findingId)
        .single();
        
      if (findingError) throw findingError;
      return findingData;
    }
  });

  if (isLoading || !data) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
         <Loader2 className="animate-spin text-primary" size={40} />
       </div>
    );
  }

  const findingType = data.type;
  const content = findingsContent[findingType] || {
    cwe: 'General Security Finding',
    impact: 'Varies based on context. Please refer to standard security guidelines.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Address the issue highlighted in the finding description.',
  };
  
  const config = severityConfig[data.severity] || severityConfig.info;
  const SeverityIcon = config.Icon;
  const scanUrl = (data.scans as any)?.url || 'Unknown Target';
  const parsedUrl = scanUrl !== 'Unknown Target' ? new URL(scanUrl) : null;
  const hostname = parsedUrl ? parsedUrl.hostname : scanUrl;

  return (
    <>
      <TopNav activeLink="Security Scans" navLinks={dashboardLinks} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen p-4 md:p-6 lg:ml-[280px]">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 group cursor-pointer w-fit"
          >
            <ArrowLeft size={18} className="text-primary group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Back to Findings
            </span>
          </motion.div>

          {/* Bento Grid */}
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-24">
            {/* Main Detail Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-12 bg-surface-container rounded-xl p-8 bento-border relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 ${config.text}`}>
                <SeverityIcon size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`${config.badgeBg} ${config.badgeText} px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-tighter`}>
                    {config.label}
                  </span>
                  {content.cwe && (
                     <span className="text-on-surface-variant font-mono text-xs font-semibold">
                      {content.cwe}
                    </span>
                  )}
                </div>
                <h1 className={`font-inter text-3xl font-bold ${config.text === 'text-error' ? 'text-error' : 'text-primary'} mb-4 tracking-tight`}>
                  {data.title}
                </h1>
                <p className="text-on-surface text-base max-w-2xl leading-relaxed">
                  {data.description}
                </p>
              </div>
            </motion.div>

            {/* Technical Evidence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-surface-container rounded-xl p-6 bento-border ${
                (!content.nginxFix && !content.apacheFix && !content.otherFix) ? 'md:col-span-12' : 'md:col-span-8'
              }`}
            >
              <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-4">
                <h3 className="font-inter text-xl font-semibold text-on-surface">
                  Observed Evidence
                </h3>
                <span className="text-primary-fixed-dim font-mono text-xs font-semibold">
                  RAW DATA
                </span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded bento-border font-mono text-xs font-semibold text-on-surface-variant leading-loose relative overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">
                  {data.evidence ? JSON.stringify(data.evidence, null, 2) : 'No raw evidence available for this check.'}
                </pre>
              </div>
              <div className="mt-6 flex items-start gap-3 p-4 bg-surface-container-high rounded border-l-4 border-tertiary-container">
                <Info size={20} className="text-tertiary-container flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-on-surface font-bold text-sm mb-1">Real-World Impact</p>
                  <p className="text-on-surface-variant text-sm">
                    {content.impact}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Remediation Sidebar (Only if remediation content exists) */}
            {(content.nginxFix || content.apacheFix || content.otherFix) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="md:col-span-4 space-y-6"
              >
                {/* Recommended Fix */}
                <div className="bg-surface-container rounded-xl p-6 bento-border">
                  <h3 className="font-mono text-xs font-semibold text-primary-fixed-dim uppercase tracking-widest mb-4">
                    {content.remediationTitle}
                  </h3>
                  <p className="text-on-surface text-sm font-medium mb-6">
                    {content.remediationDesc}
                  </p>
                  <div className="space-y-3">
                    <button className="w-full bg-primary-container text-on-primary-container py-3 rounded font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all primary-glow">
                      <Wand2 size={18} />
                      View Patches Below
                    </button>
                  </div>
                </div>

                {/* Affected Asset */}
                <div className="bg-surface-container-low rounded-xl p-6 bento-border">
                  <h3 className="font-mono text-xs font-semibold text-on-surface-variant uppercase mb-4">
                    Affected Asset
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded">
                    <Globe size={18} className="text-on-surface-variant shrink-0" />
                    <div className="overflow-hidden min-w-0">
                      <p className="text-xs text-on-surface font-bold truncate">
                        {hostname}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-mono uppercase truncate">
                        {scanUrl}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step-by-Step Remediation Details */}
            {(content.nginxFix || content.apacheFix || content.otherFix) && (
               <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="md:col-span-12 bg-surface-container rounded-xl bento-border overflow-hidden"
              >
                <div className="p-6 border-b border-outline-variant">
                  <h3 className="font-inter text-xl font-semibold text-on-surface">
                    Implementation Snippets
                  </h3>
                </div>
                <div className={`p-8 grid grid-cols-1 gap-8 ${content.nginxFix && content.apacheFix ? 'md:grid-cols-2' : ''}`}>
                  {content.nginxFix && (
                    <div>
                      <h4 className="text-primary-fixed-dim font-mono text-xs font-semibold mb-4">
                        FOR NGINX
                      </h4>
                      <div className="bg-surface-container-lowest p-4 rounded bento-border font-mono text-xs mb-4 overflow-x-auto">
                        <pre className="text-on-surface-variant">
                          {content.nginxFix}
                        </pre>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {content.nginxFixDesc}
                      </p>
                    </div>
                  )}
                  {content.apacheFix && (
                    <div>
                      <h4 className="text-primary-fixed-dim font-mono text-xs font-semibold mb-4">
                        FOR APACHE
                      </h4>
                      <div className="bg-surface-container-lowest p-4 rounded bento-border font-mono text-xs mb-4 overflow-x-auto">
                        <pre className="text-on-surface-variant">
                          {content.apacheFix}
                        </pre>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {content.apacheFixDesc}
                      </p>
                    </div>
                  )}
                  {content.otherFix && (
                    <div>
                      <h4 className="text-primary-fixed-dim font-mono text-xs font-semibold mb-4">
                        QUICK FIX
                      </h4>
                      <div className="bg-surface-container-lowest p-4 rounded bento-border font-mono text-xs mb-4 overflow-x-auto">
                        <pre className="text-on-surface-variant">
                          {content.otherFix}
                        </pre>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        {content.otherFixDesc}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
