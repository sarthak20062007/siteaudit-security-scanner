import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.' },
        { status: 500 }
      );
    }

    const { scanId } = await params;

    const { data: scan, error: scanError } = await supabaseServer
      .from('scans')
      .select('url, grade, created_at')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const { data: findings, error: findingsError } = await supabaseServer
      .from('findings')
      .select('id, type, severity, title, description, evidence')
      .eq('scan_id', scanId);

    if (findingsError) {
      console.error('Error fetching findings:', findingsError);
      return NextResponse.json({ error: 'Failed to fetch findings' }, { status: 500 });
    }

    // Sort findings: Critical -> Warning -> Info -> Good
    const severityOrder: Record<string, number> = {
      'critical': 0,
      'warning': 1,
      'info': 2,
      'good': 3
    };

    const sortedFindings = findings.sort((a, b) => {
      const orderA = severityOrder[a.severity] ?? 99;
      const orderB = severityOrder[b.severity] ?? 99;
      return orderA - orderB;
    });

    return NextResponse.json({
      scan,
      findings: sortedFindings
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
