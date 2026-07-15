import { createClient } from '@supabase/supabase-js';

// We provide fallback dummy values so the module doesn't crash on initialization 
// if the env vars are missing. This allows the API routes to return a proper 500 JSON error 
// rather than crashing the Next.js process and returning an HTML error page.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-supabase-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
