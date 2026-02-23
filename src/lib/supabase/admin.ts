import { createClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env/server';

let adminClient: any = null;

export function getSupabaseAdmin() {
    const { supabaseUrl, supabaseServiceRoleKey, missing } = getServerEnv();
    if (missing.length > 0 || !supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);
    }

    if (adminClient) {
        return adminClient;
    }

    // Server-side client with service role — bypasses RLS.
    // NEVER expose this to the browser.
    adminClient = createClient<any>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
}
