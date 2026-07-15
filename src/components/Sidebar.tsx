'use client';

import {
  LayoutDashboard,
  Shield,
  HeartPulse,
  History,
  HelpCircle,
  FileText,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: Shield, label: 'Security Scans', active: true },
  { icon: HeartPulse, label: 'Health Reports', active: false },
  { icon: History, label: 'Audit Logs', active: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-65px)] py-8 px-4 bg-surface-container-low border-r border-outline-variant fixed left-0 top-[65px] w-[280px] z-40">
      {/* User Profile */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center">
          <Shield size={18} className="text-primary" />
        </div>
        <div>
          <div className="font-mono text-xs font-semibold text-primary">Admin Panel</div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
            Security Researcher
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className={
                item.active
                  ? 'flex items-center gap-3 px-3 py-3 rounded text-primary-fixed-dim font-bold border-r-4 border-primary-fixed-dim bg-surface-container-high'
                  : 'flex items-center gap-3 px-3 py-3 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all'
              }
            >
              <Icon size={20} />
              <span className="font-mono text-xs font-semibold">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-4">
        <div className="bg-surface-container-high p-4 rounded-lg border border-outline-variant">
          <p className="text-xs font-bold text-primary mb-2">PRO PLAN ACTIVE</p>
          <button className="w-full bg-secondary-container text-secondary-fixed-dim py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-all">
            Upgrade Plan
          </button>
        </div>
        <div className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <HelpCircle size={16} />
            <span className="font-mono text-xs font-semibold">Help Center</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <FileText size={16} />
            <span className="font-mono text-xs font-semibold">Documentation</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
