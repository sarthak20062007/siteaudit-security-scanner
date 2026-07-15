import Link from 'next/link';

interface FooterProps {
  withSidebarOffset?: boolean;
}

export default function Footer({ withSidebarOffset = false }: FooterProps) {
  return (
    <footer
      className={`bg-surface-container-lowest border-t border-outline-variant flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-12 py-6 gap-4 ${
        withSidebarOffset ? 'lg:ml-[280px]' : ''
      }`}
    >
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          SiteAudit Security
        </span>
        <p className="text-on-surface-variant text-base text-center md:text-left opacity-70">
          © 2024 SiteAudit Security. All rights reserved. Professional diagnostic environment.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
          Security Resources
        </Link>
        <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
          Vulnerability Database
        </Link>
        <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
          Privacy Policy
        </Link>
        <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
          Disclaimer
        </Link>
      </div>
    </footer>
  );
}
