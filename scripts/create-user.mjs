import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAccount() {
  const email = 'denio@nexus.com';
  const password = 'password123';
  
  console.log(`Creating user: ${email}...`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirm automaticamente
    user_metadata: { name: 'Denio', role: 'admin' }
  });

  if (error) {
    if (error.message.includes('already registered')) {
        console.log('User already exists! You can log in.');
    } else {
        console.error('Error creating user:', error.message);
    }
  } else {
    console.log(`Successfully created user: ${email}`);
    console.log(`Password: ${password}`);
    console.log('User ID:', data.user.id);
  }
}

createTestAccount();
