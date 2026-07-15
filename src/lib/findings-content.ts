export interface FindingContent {
  cwe?: string;
  impact: string;
  remediationTitle: string;
  remediationDesc: string;
  nginxFix?: string;
  nginxFixDesc?: string;
  apacheFix?: string;
  apacheFixDesc?: string;
  otherFix?: string;
  otherFixDesc?: string;
}

export const findingsContent: Record<string, FindingContent> = {
  'server-signature-exposed': {
    cwe: 'CWE-200: Information Exposure',
    impact: 'Attackers can use this to automate scans for known vulnerabilities specific to your server version.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: "Update your server configuration to disable the 'Server' header or obscure its contents.",
    nginxFix: `http {\n    server_tokens off;\n}`,
    nginxFixDesc: 'This directive prevents Nginx from emitting the version number in the "Server" response header and on error pages.',
    apacheFix: `ServerTokens Prod\nServerSignature Off`,
    apacheFixDesc: 'Setting ServerTokens to Prod tells Apache to only return "Apache" in the header without versions or OS info.',
  },
  'missing-hsts': {
    cwe: 'CWE-319: Cleartext Transmission of Sensitive Information',
    impact: 'Without HSTS, attackers can perform man-in-the-middle attacks by forcing connections over unencrypted HTTP, capturing sensitive data like session cookies.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Add the Strict-Transport-Security header to ensure browsers only connect to your site over HTTPS.',
    nginxFix: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`,
    nginxFixDesc: 'This tells browsers to only use HTTPS for the next year, including all subdomains.',
    apacheFix: `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"`,
    apacheFixDesc: 'Configures Apache to send the HSTS header on all responses.',
  },
  'missing-csp': {
    cwe: 'CWE-79: Cross-site Scripting (XSS)',
    impact: 'Without a Content Security Policy, attackers who inject malicious scripts can easily execute them in the victim\'s browser.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Implement a strong Content-Security-Policy header to restrict where scripts, styles, and other resources can be loaded from.',
    nginxFix: `add_header Content-Security-Policy "default-src 'self'; script-src 'self';";`,
    nginxFixDesc: 'A restrictive baseline CSP. You will likely need to expand this based on your specific third-party dependencies.',
    apacheFix: `Header set Content-Security-Policy "default-src 'self'; script-src 'self';"`,
    apacheFixDesc: 'Sets the CSP header in Apache.',
  },
  'missing-x-frame-options': {
    cwe: 'CWE-1021: Improper Restriction of Rendered UI Layers or Frames',
    impact: 'Your site can be embedded in an iframe on a malicious site, enabling Clickjacking attacks where users are tricked into clicking sensitive buttons.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Add the X-Frame-Options header set to DENY or SAMEORIGIN.',
    nginxFix: `add_header X-Frame-Options "SAMEORIGIN" always;`,
    nginxFixDesc: 'Prevents the site from being framed by any domain other than itself.',
    apacheFix: `Header always set X-Frame-Options "SAMEORIGIN"`,
    apacheFixDesc: 'Configures Apache to send the X-Frame-Options header.',
  },
  'weak-tls': {
    cwe: 'CWE-326: Inadequate Encryption Strength',
    impact: 'TLS 1.0 and 1.1 have known cryptographic weaknesses. Attackers can intercept and decrypt traffic.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Disable support for TLS 1.0 and 1.1. Require TLS 1.2 or TLS 1.3.',
    nginxFix: `ssl_protocols TLSv1.2 TLSv1.3;`,
    nginxFixDesc: 'Explicitly defines which TLS protocols are allowed.',
    apacheFix: `SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1`,
    apacheFixDesc: 'Enables all protocols except SSLv3, TLSv1.0, and TLSv1.1.',
  },
  'cert-expiring-soon': {
    cwe: 'CWE-295: Improper Certificate Validation',
    impact: 'If the certificate expires, browsers will show a strong security warning to users, blocking access and breaking API integrations.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Renew the SSL/TLS certificate before it expires and configure automated renewal.',
    otherFix: `certbot renew`,
    otherFixDesc: 'If using Let\'s Encrypt, ensure the automated renewal job (cron or systemd timer) is running correctly.',
  },
  'missing-spf': {
    cwe: 'CWE-358: Improperly Implemented Security Check for Standard',
    impact: 'Attackers can spoof your domain to send phishing emails, damaging your reputation and causing legitimate emails to go to spam.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Add a TXT record to your DNS configuration for SPF (Sender Policy Framework).',
    otherFix: `v=spf1 mx a include:_spf.google.com ~all`,
    otherFixDesc: 'A sample SPF record. Replace include mechanisms with the actual email service providers you use.',
  },
  'missing-dmarc': {
    cwe: 'CWE-358: Improperly Implemented Security Check for Standard',
    impact: 'Without DMARC, receiving email servers don\'t know how to handle emails that fail SPF or DKIM checks.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Add a _dmarc TXT record to your DNS configuration to enforce policies on unauthenticated email.',
    otherFix: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com;`,
    otherFixDesc: 'A sample DMARC record that quarantines failing emails and sends aggregate reports.',
  },
  'outdated-cms': {
    cwe: 'CWE-1104: Use of Unmaintained Third Party Components',
    impact: 'Known vulnerabilities in outdated CMS software are frequently targeted by automated botnets, leading to complete site compromise.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'Upgrade your CMS to the latest version immediately and apply all security patches.',
    otherFix: 'Check CMS Dashboard',
    otherFixDesc: 'Log in to your CMS admin panel and apply pending core, theme, and plugin updates.',
  },
  'blacklisted': {
    cwe: 'CWE-798: Use of Hard-coded Credentials (or similar compromise indicator)',
    impact: 'Your domain is flagged by security vendors (like Google Safe Browsing). Users will see massive red warning screens, and search ranking will tank.',
    remediationTitle: 'Recommended Fix',
    remediationDesc: 'You must identify and remove the malware/phishing content on your site, then request a review from the flagging authority.',
    otherFix: 'Google Search Console',
    otherFixDesc: 'Log into Google Search Console, check the "Security Issues" tab for details, fix the root cause, and request a review.',
  }
};
