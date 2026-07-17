import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing-supabase-url.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-service-key';

// Create a single supabase client for interacting with your database on the server
// using the service role key to bypass RLS.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
