import { SeverityLevel } from '@/types';

export function calculateScore(findings: { severity: string }[]) {
  let score = 100;

  findings.forEach((finding) => {
    switch (finding.severity.toLowerCase()) {
      case 'critical':
        score -= 20;
        break;
      case 'warning':
        score -= 8;
        break;
      case 'info':
        score -= 2;
        break;
      // 'good' has no penalty
    }
  });

  return Math.max(0, score); // Score cannot be negative
}

export function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
