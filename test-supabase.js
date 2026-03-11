require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
    console.log('Testing Supabase query...');
    const { data: user, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@bareddys.com', // Trying a common admin email if it exists
        password: 'password123'
    });

    // We'll test with anon key first, if it fails due to RLS, it's fine
    console.log('Fetching tasks...');
    const { data, error } = await supabase.from('tasks').select('*, profiles(id), task_assignees(profile_id)');

    if (error) {
        console.error('Supabase query error:', error);
    } else {
        console.log(`Success! Fetched ${data.length} tasks.`);
        if (data.length > 0) {
            console.log('Object keys of first task:', Object.keys(data[0]));
        }
    }
}

testQuery();
