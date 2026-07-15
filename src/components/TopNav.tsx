'use client';

import Link from 'next/link';
import { Bell, Settings } from 'lucide-react';

interface TopNavProps {
  activeLink?: string;
  navLinks?: { label: string; href: string }[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultLinks = [
  { label: 'Solutions', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Docs', href: '#' },
];

const dashboardLinks = [
  { label: 'Dashboard', href: '#' },
  { label: 'Security Scans', href: '#' },
  { label: 'Health Reports', href: '#' },
];

export default function TopNav({
  activeLink = '',
  navLinks,
  ctaLabel = 'New Scan',
  ctaHref = '/',
}: TopNavProps) {
  const links = navLinks ?? defaultLinks;

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center w-full px-6 md:px-12 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/">
          <span className="font-inter text-xl font-bold text-primary tracking-tight cursor-pointer">
            SiteAudit
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                activeLink === link.label
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors duration-200 px-3 py-1 rounded'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors">
          <Settings size={20} />
        </button>
        <Link
          href={ctaHref}
          className="bg-primary-container text-on-primary-container px-6 py-2 rounded font-bold text-xs font-mono uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all"
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}

export { defaultLinks, dashboardLinks };
