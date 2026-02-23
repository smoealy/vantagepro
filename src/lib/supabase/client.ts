import { createClient } from '@supabase/supabase-js';
import { getClientEnv } from '@/lib/env/client';

let browserClient: any = null;

export function getSupabaseClient() {
    const { supabaseUrl, supabaseAnonKey, missing } = getClientEnv();
    if (missing.length > 0 || !supabaseUrl || !supabaseAnonKey) {
        throw new Error(`Missing required client environment variables: ${missing.join(', ')}`);
    }

    if (browserClient) {
        return browserClient;
    }

    browserClient = createClient<any>(supabaseUrl, supabaseAnonKey);
    return browserClient;
}
