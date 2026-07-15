export type SeverityLevel = 'critical' | 'warning' | 'good' | 'info';

export interface ScanCheck {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'running' | 'complete';
  resultLabel?: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: SeverityLevel;
  description: string;
  evidence?: string;
  cwe?: string;
}

export interface ScanResult {
  grade: string;
  target: string;
  findings: Finding[];
  checks: ScanCheck[];
}
