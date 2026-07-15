'use client';

import { Globe, Radar, Lock, Terminal, Mail, Package, ArrowRight, Loader2 } from 'lucide-react';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const features = [
  {
    icon: Lock,
    title: 'SSL/TLS',
    description: 'Deep analysis of certificate chains, cipher strength, and protocol support.',
  },
  {
    icon: Terminal,
    title: 'Security Headers',
    description: 'Verify HSTS, CSP, X-Frame-Options and other vital HTTP response headers.',
  },
  {
    icon: Mail,
    title: 'Email Security',
    description: 'Audit SPF, DKIM, and DMARC records to prevent spoofing and improve delivery.',
  },
  {
    icon: Package,
    title: 'CMS Audit',
    description: 'Detect version leaks, insecure plugins, and known exploits for WordPress/Joomla.',
  },
];

const stats = [
  { value: '2.4M+', label: 'Scans Performed' },
  { value: '99.9%', label: 'Accuracy Rate' },
  { value: '< 15s', label: 'Average Scan Time' },
];

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
});

export default function LandingPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: '' }
  });

  const onSubmit = async (data: { url: string }) => {
    setSubmitError(null);
    try {
      // Ensure URL has protocol
      let submitUrl = data.url;
      if (!submitUrl.startsWith('http://') && !submitUrl.startsWith('https://')) {
        submitUrl = 'https://' + submitUrl;
      }

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submitUrl }),
      });
      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to start scan');
      }

      router.push(`/scanning/${resData.scanId}`);
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };
  return (
    <>
      <TopNav />
      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-[921px] flex flex-col justify-center items-center px-4 relative overflow-hidden">
          {/* Atmospheric Background */}
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl w-full text-center z-10"
          >
            <h1 className="font-inter text-3xl md:text-[64px] md:leading-[1.1] font-bold text-on-surface mb-6 tracking-tighter">
              Is your website secure?
            </h1>
            <p className="text-on-surface-variant text-base md:text-xl font-semibold mb-12 max-w-2xl mx-auto">
              Professional-grade security diagnostics for the modern web. Identify
              vulnerabilities, misconfigurations, and threats in seconds.
            </p>

            {/* URL Scanner Component */}
            <div className="max-w-3xl mx-auto w-full group relative">
              <form 
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col md:flex-row gap-0 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low shadow-2xl transition-all duration-300 focus-within:border-primary-container hover:border-outline"
              >
                <div className="flex items-center px-5 bg-surface-container-low border-r border-outline-variant">
                  <Globe className="text-outline" size={20} />
                </div>
                <input
                  {...register('url')}
                  className="scan-input flex-1 bg-surface-container-low text-on-surface px-6 py-5 font-mono text-sm border-none placeholder:text-outline/50 focus:outline-none"
                  placeholder="https://example.com"
                  type="text"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-container text-on-primary-container px-10 py-5 font-bold font-inter text-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? 'Initializing...' : 'Scan Now'}
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Radar size={20} />}
                </button>
              </form>
              
              {errors.url && (
                <div className="mt-2 text-error text-sm font-medium">{errors.url.message as string}</div>
              )}
              {submitError && (
                <div className="mt-2 text-error text-sm font-medium">{submitError}</div>
              )}

              {/* Status Indicators */}
              <div className="mt-4 flex justify-center items-center gap-6 font-mono text-xs font-semibold text-outline uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                  Network Active
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                  Global Nodes: 12
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group bg-surface-container-low border border-outline-variant p-8 rounded-lg hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-surface-container-high rounded flex items-center justify-center mb-6 border border-outline-variant group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                    <Icon className="text-primary" size={22} />
                  </div>
                  <h3 className="font-inter text-xl font-semibold text-on-surface mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-on-surface-variant text-base mb-6">{feature.description}</p>
                  <div className="font-mono text-xs font-semibold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    View Specs <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="py-24 border-t border-outline-variant"
        >
          <div className="px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-around items-center gap-12 text-center">
            <div className="flex items-center gap-12">
              <div>
                <div className="font-inter text-3xl font-bold text-primary mb-2">
                  {statsData?.totalScans || '2.4M+'}
                </div>
                <div className="font-mono text-xs font-semibold text-outline uppercase tracking-widest">
                  Scans Performed
                </div>
              </div>
              <div className="h-12 w-px bg-outline-variant hidden md:block" />
            </div>
            
            <div className="flex items-center gap-12">
              <div>
                <div className="font-inter text-3xl font-bold text-primary mb-2">
                  {statsData?.accuracy || '99.9%'}
                </div>
                <div className="font-mono text-xs font-semibold text-outline uppercase tracking-widest">
                  Accuracy Rate
                </div>
              </div>
              <div className="h-12 w-px bg-outline-variant hidden md:block" />
            </div>

            <div className="flex items-center gap-12">
              <div>
                <div className="font-inter text-3xl font-bold text-primary mb-2">
                  {statsData?.avgTime || '< 15s'}
                </div>
                <div className="font-mono text-xs font-semibold text-outline uppercase tracking-widest">
                  Average Scan Time
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}
