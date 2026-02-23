const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    console.log('--- Testing OpenAI ---');
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "test" }],
            model: "gpt-4o",
            max_tokens: 5
        });
        console.log('OpenAI Success:', completion.choices[0].message.content);
    } catch (e) {
        console.error('OpenAI Error:', e.message);
    }

    console.log('\n--- Testing Supabase ---');
    try {
        const { data, error } = await supabase.from('projects').select('id').limit(1);
        if (error) console.error('Supabase Error:', error.message);
        else console.log('Supabase Success:', data);
    } catch (e) {
        console.error('Supabase Catch Error:', e.message);
    }
}

test();
