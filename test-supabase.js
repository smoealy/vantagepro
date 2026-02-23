const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('projects').select('id').limit(1);
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Success:', data);
        }
    } catch (e) {
        console.error('Catch Error:', e.message);
    }
}

test();
