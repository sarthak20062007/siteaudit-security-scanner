import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const scanSchema = z.object({
  url: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
});

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.' },
        { status: 500 }
      );
    }

    // Basic IP-based rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait before scanning again.' }, { status: 429 });
    }

    const body = await request.json();
    
    // Validate URL
    const result = scanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Ensure it's http/https
    const parsedUrl = new URL(result.data.url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
       return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 });
    }

    // Create scan in database
    const { data, error } = await supabaseServer
      .from('scans')
      .insert([
        { url: result.data.url, status: 'pending' }
      ])
      .select('id')
      .single();

    if (error || !data) {
      console.error('Supabase error details:', error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      } : 'No error, just no data');
      return NextResponse.json({ error: 'Failed to initialize scan in database' }, { status: 500 });
    }

    return NextResponse.json({ scanId: data.id });
  } catch (error) {
    console.error('Scan init error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
