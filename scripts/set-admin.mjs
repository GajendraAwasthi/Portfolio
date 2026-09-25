import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Writable } from 'node:stream';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

let echoInput = true;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (echoInput) process.stdout.write(chunk, encoding);
    callback();
  },
});
const rl = readline.createInterface({
  input: process.stdin,
  output,
  terminal: Boolean(process.stdin.isTTY),
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));
const askSecret = async (query) => {
  process.stdout.write(query);
  echoInput = false;
  try {
    return await ask('');
  } finally {
    echoInput = true;
    process.stdout.write('\n');
  }
};

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

  const password = await askSecret('Enter new Password: ');
  if (!password || password.length < 12) {
    console.error('Password must be at least 12 characters.');
    rl.close();
    process.exit(1);
  }

  console.log('\nEncrypting password with bcrypt...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Cloud and local stores are exclusive authentication backends.
  const env = loadEnvLocal();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl || serviceRoleKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (!supabaseUrl?.startsWith('https://') || !serviceRoleKey) {
      throw new Error('Supabase URL and service role key are both required.');
    }
    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: admins, error: lookupError } = await supabase.from('admin_users').select('id').limit(2);
    if (lookupError) throw lookupError;
    if (admins.length > 1) throw new Error('Multiple admin accounts exist; rotate them manually.');
    const result = admins.length
      ? await supabase.from('admin_users').update({ username, email, password_hash: passwordHash }).eq('id', admins[0].id)
      : await supabase.from('admin_users').insert({ username, email, password_hash: passwordHash });
    if (result.error) throw result.error;
    const { error: sessionError } = await supabase.from('auth_sessions').delete().neq('session_token', '__dummy__');
    if (sessionError) throw sessionError;
    console.log('✓ Updated Supabase admin credentials and revoked sessions.');
  } else {
    const authStorePath = path.join(process.cwd(), 'data', 'auth-store.json');
    fs.mkdirSync(path.dirname(authStorePath), { recursive: true });
    const localStore = {
      admin_users: [{ id: 'usr-admin-' + Date.now(), username, email, password_hash: passwordHash,
        created_at: new Date().toISOString(), last_login: null }],
      auth_sessions: [],
    };
    const temporary = authStorePath + '.' + process.pid + '.tmp';
    try {
      fs.writeFileSync(temporary, JSON.stringify(localStore), { mode: 0o600, flag: 'wx' });
      fs.renameSync(temporary, authStorePath);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    console.log('✓ Updated local admin credentials and revoked sessions.');
  }

  console.log('\n===========================================');
  console.log('SUCCESS: Admin credentials updated.');
  console.log(`Username: ${username}`);
  console.log(`Email:    ${email}`);
  console.log('Password: [Hashed with bcrypt]');
  console.log('===========================================\n');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
