const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  const env = dotenv.parse(fs.readFileSync('.env.local'));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  async function rebrand() {
    console.log('Rebranding MEO to Telecom at:', env.NEXT_PUBLIC_SUPABASE_URL);

    // 1. Update Companies
    console.log('Updating companies...');
    await supabase.from('companies').update({ name: 'Telecom AI', slug: 'telecom' }).eq('slug', 'meo');

    // 2. Update Profiles (Email domains)
    console.log('Updating profiles (emails)...');
    const { data: profiles } = await supabase.from('profiles').select('id, email');
    if (profiles) {
      for (const p of profiles) {
        if (p.email && p.email.endsWith('@meo.pt')) {
          const newEmail = p.email.replace('@meo.pt', '@telecom.pt');
          await supabase.from('profiles').update({ email: newEmail }).eq('id', p.id);
        }
      }
    }

    // 3. Update Skills (Title, Desc, Tags)
    console.log('Updating skills (titles/tags)...');
    const { data: skills } = await supabase.from('skills').select('id, title, description, tags');
    if (skills) {
      for (const s of skills) {
        const newTitle = s.title.replace(/MEO/g, 'Telecom');
        const newDesc = s.description ? s.description.replace(/MEO/g, 'Telecom') : null;
        let newTags = s.tags || [];
        if (newTags.includes('MEO')) {
          newTags = newTags.map(t => t === 'MEO' ? 'Telecom' : t);
        }
        await supabase.from('skills').update({ 
          title: newTitle, 
          description: newDesc,
          tags: newTags
        }).eq('id', s.id);
      }
    }

    console.log('REBRANDING COMPLETE');
  }

  rebrand();
} else {
  console.log('.env.local not found');
}
