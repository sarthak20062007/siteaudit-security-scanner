import tls from 'tls';

export async function checkSSL(urlStr: string) {
  const findings: any[] = [];
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;
    
    // We only check HTTPS
    if (url.protocol !== 'https:') {
      findings.push({
        type: 'missing-https',
        severity: 'critical',
        title: 'HTTPS Not Used',
        description: 'The provided URL does not use HTTPS, which means all traffic is unencrypted.',
        evidence: { protocol: url.protocol }
      });
      return findings;
    }

    const certData = await new Promise<any>((resolve, reject) => {
      const socket = tls.connect(443, hostname, { servername: hostname }, () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        socket.end();
        resolve({ cert, protocol });
      });

      socket.on('error', (err) => {
        reject(err);
      });
      
      // Timeout after 10s
      setTimeout(() => {
        socket.destroy();
        reject(new Error('TLS connection timeout'));
      }, 10000);
    });

    const { cert, protocol } = certData;

    // Check Protocol
    if (protocol === 'TLSv1' || protocol === 'TLSv1.1') {
      findings.push({
        type: 'weak-tls',
        severity: 'critical',
        title: 'Weak TLS Protocol Enabled',
        description: `Server negotiated an insecure protocol (${protocol}).`,
        evidence: { protocol }
      });
    }

    // Check Expiry
    if (cert && cert.valid_to) {
      const expiryDate = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        findings.push({
          type: 'cert-expired',
          severity: 'critical',
          title: 'SSL Certificate Expired',
          description: `The SSL certificate expired ${Math.abs(daysUntilExpiry)} days ago.`,
          evidence: { valid_to: cert.valid_to }
        });
      } else if (daysUntilExpiry < 30) {
        findings.push({
          type: 'cert-expiring-soon',
          severity: 'warning',
          title: 'SSL Certificate Expiring Soon',
          description: `The SSL certificate will expire in ${daysUntilExpiry} days.`,
          evidence: { valid_to: cert.valid_to, days_remaining: daysUntilExpiry }
        });
      } else {
        findings.push({
          type: 'ssl-valid',
          severity: 'good',
          title: 'SSL Certificate Valid',
          description: `Your certificate expires in ${daysUntilExpiry} days. Issued by ${cert.issuer?.O || 'Unknown'}.`,
          evidence: { issuer: cert.issuer?.O, valid_to: cert.valid_to }
        });
      }
    }
  } catch (error: any) {
    findings.push({
      type: 'ssl-error',
      severity: 'warning',
      title: 'SSL Check Failed',
      description: 'Could not establish a secure connection to verify the certificate.',
      evidence: { error: error.message }
    });
  }

  return findings;
}
