import fs from 'fs';
import path from 'path';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key) env[key.trim()] = vals.join('=').trim();
  }
  return env;
}

async function main() {
  console.log('\n===========================================');
  console.log('       ADMIN CREDENTIALS MANAGER           ');
  console.log('===========================================\n');

  const username = (await ask('Enter new Admin Username: ')).trim();
  if (!username) {
    console.error('Username cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const email = (await ask('Enter Admin Email: ')).trim();
  if (!email) {
    console.error('Email cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const password = (await ask('Enter new Password: ')).trim();
  if (!password || password.length < 6) {
    console.error('Password must be at least 6 characters.');
    rl.close();
    process.exit(1);
  }

  console.log('\nEncrypting password with bcrypt...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 1. Update local auth-store.json
  const authStorePath = path.join(process.cwd(), 'data', 'auth-store.json');
  const authDir = path.dirname(authStorePath);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const localStore = {
    admin_users: [
      {
        id: 'usr-admin-' + Date.now(),
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        last_login: null,
      },
    ],
    auth_sessions: [],
  };

  fs.writeFileSync(authStorePath, JSON.stringify(localStore, null, 2), 'utf-8');
  console.log('✓ Updated local store: data/auth-store.json (default password removed)');

  // 2. Check and update Supabase if configured
  const env = loadEnvLocal();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    try {
      console.log('Connecting to Supabase...');
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });

      // Clear old admins and insert new admin
      await supabase.from('admin_users').delete().neq('username', '');
      const { error } = await supabase.from('admin_users').insert({
        username,
        email,
        password_hash: passwordHash,
      });

      if (error) {
        console.warn('Note: Could not update Supabase automatically:', error.message);
      } else {
        console.log('✓ Successfully updated Supabase admin_users table in the cloud!');
      }
    } catch (err) {
      console.warn('Note: Supabase update skipped:', err.message);
    }
  } else {
    console.log('\n(Supabase credentials not detected in .env.local yet)');
  }

  console.log('\n===========================================');
  console.log('SUCCESS: Admin credentials updated.');
  console.log(`Username: ${username}`);
  console.log(`Email:    ${email}`);
  console.log('Password: [Encrypted with bcrypt]');
  console.log('===========================================\n');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
