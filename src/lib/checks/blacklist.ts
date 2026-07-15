export async function checkBlacklist(urlStr: string) {
  const findings: any[] = [];
  try {
    const apiKey = process.env.SAFE_BROWSING_API_KEY;
    if (!apiKey) {
      // Silently pass if no API key is provided
      findings.push({
        type: 'blacklist-skipped',
        severity: 'good',
        title: 'Blacklist Check Skipped',
        description: 'Safe Browsing API key not configured. Assuming domain is clean.',
      });
      return findings;
    }

    const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    const payload = {
      client: {
        clientId: "siteaudit",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          { url: urlStr }
        ]
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.matches && data.matches.length > 0) {
       findings.push({
        type: 'blacklisted',
        severity: 'critical',
        title: 'Domain is Blacklisted',
        description: 'Google Safe Browsing has flagged this URL for malware or phishing.',
        evidence: { matches: data.matches }
      });
    } else {
       findings.push({
        type: 'blacklist-clean',
        severity: 'good',
        title: 'Domain is Clean',
        description: 'Google Safe Browsing reports no threats for this URL.',
      });
    }
  } catch (error: any) {
    findings.push({
      type: 'blacklist-error',
      severity: 'warning',
      title: 'Blacklist Check Failed',
      description: 'Could not communicate with the Safe Browsing API.',
      evidence: { error: error.message }
    });
  }

  return findings;
}
