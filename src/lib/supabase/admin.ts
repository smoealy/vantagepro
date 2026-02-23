import { createClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env/server';

const { supabaseUrl, supabaseServiceRoleKey } = getServerEnv();

// Server-side client with service role — bypasses RLS.
// NEVER expose this to the browser.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
