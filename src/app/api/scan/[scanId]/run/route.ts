import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { checkSSL } from '@/lib/checks/ssl';
import { checkHeaders } from '@/lib/checks/headers';
import { checkDNS } from '@/lib/checks/dns';
import { checkCMS } from '@/lib/checks/cms';
import { checkBlacklist } from '@/lib/checks/blacklist';
import { calculateScore, getGradeFromScore } from '@/lib/scoring';

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

    // 1. Fetch scan
    const { data: scan, error: fetchError } = await supabaseServer
      .from('scans')
      .select('url, status')
      .eq('id', scanId)
      .single();

    if (fetchError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (scan.status !== 'pending') {
      return NextResponse.json({ message: 'Scan already running or complete' });
    }

    // 2. Mark as running
    await supabaseServer
      .from('scans')
      .update({ status: 'running' })
      .eq('id', scanId);

    // 3. Run all checks in parallel
    const url = scan.url;
    const results = await Promise.allSettled([
      checkSSL(url),
      checkHeaders(url),
      checkDNS(url),
      checkCMS(url),
      checkBlacklist(url)
    ]);

    // Flatten findings
    const allFindings: any[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allFindings.push(...result.value);
      } else if (result.status === 'rejected') {
        console.error('Check failed unexpectedly:', result.reason);
      }
    });

    // 4. Calculate Score
    const score = calculateScore(allFindings);
    const grade = getGradeFromScore(score);

    // 5. Save findings
    const findingsToInsert = allFindings.map(f => ({
      scan_id: scanId,
      type: f.type,
      severity: f.severity,
      title: f.title,
      description: f.description,
      evidence: f.evidence || null
    }));

    if (findingsToInsert.length > 0) {
      const { error: findingsError } = await supabaseServer
        .from('findings')
        .insert(findingsToInsert);
        
      if (findingsError) {
         console.error('Error saving findings:', findingsError);
      }
    }

    // 6. Mark as complete
    console.log(`Setting scan ${scanId} to complete with grade ${grade}`);
    const { error: updateError } = await supabaseServer
      .from('scans')
      .update({ status: 'complete', grade })
      .eq('id', scanId);

    if (updateError) {
      console.error('Failed to update scan status to complete:', updateError);
    } else {
      console.log(`Successfully updated scan ${scanId} to complete`);
    }

    return NextResponse.json({ success: true, grade, findingsCount: allFindings.length });

  } catch (error: any) {
    console.error('Run scan error:', error);
    // Mark as error
    await supabaseServer
      .from('scans')
      .update({ status: 'error' })
      .eq('id', params.scanId);
      
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
