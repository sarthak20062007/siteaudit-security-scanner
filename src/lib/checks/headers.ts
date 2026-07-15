export async function checkHeaders(urlStr: string) {
  const findings: any[] = [];
  try {
    // Adding a timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(urlStr, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'SiteAudit Security Scanner (Mozilla/5.0)',
      }
    });
    
    clearTimeout(timeoutId);

    const headers = response.headers;
    let missingHeaders = 0;

    // Check HSTS
    const hsts = headers.get('strict-transport-security');
    if (!hsts) {
      findings.push({
        type: 'missing-hsts',
        severity: 'warning',
        title: 'Missing HSTS Header',
        description: 'HTTP Strict Transport Security is not enabled.',
        evidence: { header: 'Strict-Transport-Security missing' }
      });
      missingHeaders++;
    }

    // Check CSP
    const csp = headers.get('content-security-policy');
    if (!csp) {
      findings.push({
        type: 'missing-csp',
        severity: 'warning',
        title: 'Missing Content Security Policy',
        description: 'No Content-Security-Policy header found. Leaves site vulnerable to XSS.',
        evidence: { header: 'Content-Security-Policy missing' }
      });
      missingHeaders++;
    }

    // Check X-Frame-Options
    const xfo = headers.get('x-frame-options');
    if (!xfo && !csp?.includes('frame-ancestors')) {
      findings.push({
        type: 'missing-x-frame-options',
        severity: 'warning',
        title: 'Missing X-Frame-Options',
        description: 'Site could be vulnerable to Clickjacking attacks.',
        evidence: { header: 'X-Frame-Options missing' }
      });
      missingHeaders++;
    }

    if (missingHeaders === 0) {
       findings.push({
        type: 'headers-secure',
        severity: 'good',
        title: 'Security Headers Present',
        description: 'Core HTTP security headers are correctly configured.',
      });
    }

  } catch (error: any) {
    findings.push({
      type: 'headers-error',
      severity: 'info',
      title: 'Headers Check Failed',
      description: 'Could not fetch the URL to read headers.',
      evidence: { error: error.message }
    });
  }

  return findings;
}
