import dns from 'dns';

export async function checkDNS(urlStr: string) {
  const findings: any[] = [];
  try {
    const url = new URL(urlStr);
    const domain = url.hostname.replace(/^www\./, ''); // basic apex domain extraction

    const txtRecords = await dns.promises.resolveTxt(domain).catch(() => []);
    const flatTxt = txtRecords.map(r => r.join(' '));
    
    // Check SPF
    const hasSPF = flatTxt.some(record => record.startsWith('v=spf1'));
    if (!hasSPF) {
      findings.push({
        type: 'missing-spf',
        severity: 'warning',
        title: 'Missing SPF Record',
        description: 'No Sender Policy Framework (SPF) record found. Domain could be spoofed in emails.',
        evidence: { domain }
      });
    }

    // Check DMARC
    const dmarcDomain = `_dmarc.${domain}`;
    const dmarcRecords = await dns.promises.resolveTxt(dmarcDomain).catch(() => []);
    const flatDmarc = dmarcRecords.map(r => r.join(' '));
    const hasDMARC = flatDmarc.some(record => record.startsWith('v=DMARC1'));
    
    if (!hasDMARC) {
      findings.push({
        type: 'missing-dmarc',
        severity: 'info',
        title: 'Missing DMARC Record',
        description: 'No DMARC policy found for email authentication.',
        evidence: { domain: dmarcDomain }
      });
    }

    if (hasSPF && hasDMARC) {
       findings.push({
        type: 'dns-secure',
        severity: 'good',
        title: 'Email Security Records Present',
        description: 'SPF and DMARC records are configured for the domain.',
      });
    }

  } catch (error: any) {
     findings.push({
      type: 'dns-error',
      severity: 'info',
      title: 'DNS Check Failed',
      description: 'Could not perform DNS lookups for the domain.',
      evidence: { error: error.message }
    });
  }

  return findings;
}
