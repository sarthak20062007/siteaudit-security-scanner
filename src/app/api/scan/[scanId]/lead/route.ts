import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const leadSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  message: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { scanId: string } }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.' },
        { status: 500 }
      );
    }

    const { scanId } = params;
    const body = await request.json();
    
    // Validate payload
    const result = leadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    // Create lead in database
    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          scan_id: scanId,
          email: result.data.email, 
          message: result.data.message || '' 
        }
      ]);

    if (error) {
      console.error('Supabase error inserting lead:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
