require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
    console.log('Testing Supabase query...');
    const { data: user, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@bareddys.com', // Try admin login
        password: 'password123'
    });

    if (authError) {
        console.log('Auth check:', authError.message);
    } else {
        console.log('Auth success');
    }

    console.log('Fetching tasks...');
    const { data, error } = await supabase.from('tasks').select('*, profiles(id), task_assignees(profile_id)');

    if (error) {
        console.error('Supabase query error:', error);
    } else {
        console.log(`Success! Fetched ${data.length} tasks.`);
        if (data.length > 0) {
            console.log('Object keys of first task:', Object.keys(data[0]));
            // Check for team column
            console.log('Has team column?', Object.keys(data[0]).includes('team'));
        }
    }
}

testQuery();
