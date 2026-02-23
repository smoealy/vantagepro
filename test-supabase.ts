import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('projects').select('id').limit(1);
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Supabase Success:', data);
    }
}

test();
