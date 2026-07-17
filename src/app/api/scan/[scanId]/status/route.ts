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

    const { data: scan, error } = await supabaseServer
      .from('scans')
      .select('status')
      .eq('id', scanId)
      .single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    return NextResponse.json({ status: scan.status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
