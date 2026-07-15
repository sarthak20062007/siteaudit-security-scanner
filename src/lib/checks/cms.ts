export async function checkCMS(urlStr: string) {
  const findings: any[] = [];
  try {
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
    const body = await response.text();

    // Check Server Header
    const serverHeader = headers.get('server');
    if (serverHeader && /\d/.test(serverHeader)) {
      // Contains numbers, likely exposing version
      findings.push({
        type: 'server-signature-exposed',
        severity: 'critical',
        title: 'Server Signature Exposed',
        description: 'Server version information is being leaked in headers.',
        evidence: { header: `Server: ${serverHeader}` }
      });
    }

    // Check X-Powered-By
    const poweredBy = headers.get('x-powered-by');
    if (poweredBy) {
      findings.push({
        type: 'x-powered-by-exposed',
        severity: 'warning',
        title: 'Technology Stack Exposed',
        description: 'The X-Powered-By header leaks the backend technology in use.',
        evidence: { header: `X-Powered-By: ${poweredBy}` }
      });
    }

    // Check Meta Generator
    const generatorMatch = body.match(/<meta\s+name=["']generator["']\s+content=["']([^"']+)["']/i);
    if (generatorMatch && generatorMatch[1]) {
      const generator = generatorMatch[1];
      findings.push({
        type: 'cms-version-exposed',
        severity: 'info',
        title: 'CMS Version Exposed in HTML',
        description: 'A meta generator tag is exposing the CMS version.',
        evidence: { generator }
      });
    }
    
    // Quick passive check for WordPress common path (just a HEAD request)
    try {
      const url = new URL(urlStr);
      const wpUrl = new URL('/wp-login.php', url.origin);
      const wpCheck = await fetch(wpUrl.toString(), { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      if (wpCheck.status === 200) {
         findings.push({
          type: 'wordpress-detected',
          severity: 'info',
          title: 'WordPress Detected',
          description: 'WordPress login page is publicly accessible.',
          evidence: { path: '/wp-login.php' }
        });
      }
    } catch (e) {
      // ignore
    }

    if (findings.length === 0) {
       findings.push({
        type: 'no-cms-leaks',
        severity: 'good',
        title: 'No Tech Stack Leaks',
        description: 'Server and CMS version information are successfully hidden.',
      });
    }

  } catch (error: any) {
    findings.push({
      type: 'cms-error',
      severity: 'info',
      title: 'CMS Check Failed',
      description: 'Could not fetch the URL to analyze the CMS.',
      evidence: { error: error.message }
    });
  }

  return findings;
}
