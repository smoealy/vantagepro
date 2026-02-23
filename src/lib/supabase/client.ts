import { createClient } from '@supabase/supabase-js';
import { getClientEnv } from '@/lib/env/client';

const { supabaseUrl, supabaseAnonKey } = getClientEnv();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
