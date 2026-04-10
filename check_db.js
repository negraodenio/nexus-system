const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  const env = dotenv.parse(fs.readFileSync('.env.local'));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  async function check() {
    console.log('Checking URL:', env.NEXT_PUBLIC_SUPABASE_URL);
    const { data: users, error: e1 } = await supabase.auth.admin.listUsers();
    const { data: profiles, error: e2 } = await supabase.from('profiles').select('*');
    const { count: skillsCount, error: e3 } = await supabase.from('skills').select('count', { count: 'exact', head: true });
    
    console.log('Auth Users:', users ? users.users.length : 'Error: ' + e1?.message);
    console.log('Profiles:', profiles ? profiles.length : 'Error: ' + e2?.message);
    console.log('Skills Count:', skillsCount !== null ? skillsCount : 'Error: ' + e3?.message);
    
    if (profiles) {
      const demo = profiles.find(p => p.email === 'demo@nexusmotion.pt');
      console.log('Demo User Profile:', demo ? JSON.stringify(demo, null, 2) : 'NOT FOUND');
    }
  }
  check();
} else {
  console.log('.env.local not found');
}
