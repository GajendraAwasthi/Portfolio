import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

async function syncToSupabase() {
  const env = loadEnvLocal();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase cloud push requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exitCode = 1;
    return;
  }

  console.log('🚀 Connecting to Supabase with Service Role Key...');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const dataPath = path.join(process.cwd(), 'data', 'portfolio-store.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Data file data/portfolio-store.json not found.');
    process.exitCode = 1;
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  try {
    // 1. Settings
    if (data.settings) {
      const s = data.settings;
      const { error } = await supabase.from('site_settings').upsert({
        id: 'default',
        meta_title: s.metaTitle,
        meta_description: s.metaDescription,
        meta_keywords: s.metaKeywords,
        og_image: s.ogImage,
        favicon: s.favicon,
        theme_color: s.themeColor,
        enable_audio_easter_egg: s.enableAudioEasterEgg,
        mobile_audio_src: s.mobileAudioSrc,
        desktop_audio_src: s.desktopAudioSrc,
        attention_title_blink: s.attentionTitleBlink,
        footer_owner: s.footerOwner,
        footer_tagline: s.footerTagline,
        footer_subtext: s.footerSubtext,
        last_updated_text: s.lastUpdatedText,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      console.log('✓ Synchronized site_settings');
    }

    // 2. Profile
    if (data.profile) {
      const p = data.profile;
      const { error } = await supabase.from('profile').upsert({
        id: 'default',
        name: p.name,
        surname_gradient: p.surnameGradient,
        avatar_url: p.avatarUrl,
        headline_typing: p.headlineTyping,
        description: p.description,
        resume_url: p.resumeUrl,
        contact_email: p.contactEmail,
        social_links: p.socialLinks,
        cta_buttons: p.ctaButtons,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      console.log('✓ Synchronized profile');
    }

    // Helper for table sync
    const syncTable = async (tableName, items, transform = null) => {
      if (!Array.isArray(items)) return;
      if (!items.every((item) => typeof item.id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(item.id))) {
        throw new Error(`Invalid IDs in ${tableName}; cloud content was not pruned.`);
      }
      if (items.length > 0) {
        const payload = transform ? items.map(transform) : items;
        const { error } = await supabase.from(tableName).upsert(payload);
        if (error) throw error;
      }
      const deletion = items.length
        ? supabase.from(tableName).delete().not('id', 'in', `(${items.map((item) => item.id).join(',')})`)
        : supabase.from(tableName).delete().neq('id', '__dummy__');
      const { error } = await deletion;
      if (error) throw error;
      console.log(`✓ Synchronized ${tableName} (${items.length} items)`);
    };

    await syncTable('about_cards', data.aboutCards);
    await syncTable('stats', data.stats);
    await syncTable('education', data.education);
    await syncTable('experience', data.experience);
    await syncTable('skills', data.skills);
    await syncTable('certifications', data.certifications, (c) => ({
      id: c.id, title: c.title, image_url: c.imageUrl, issuer: c.issuer,
      issue_date: c.issueDate, credential_url: c.credentialUrl,
      order_index: c.order_index, is_active: c.is_active,
    }));
    await syncTable('projects', data.projects, (p) => ({
      id: p.id, title: p.title, description: p.description, team: p.team,
      tags: p.tags, github_url: p.githubUrl, live_url: p.liveUrl, image_url: p.imageUrl,
      order_index: p.order_index, is_active: p.is_active,
    }));
    await syncTable('videos', data.videos, (v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtube_url: v.youtubeUrl,
      embed_id: v.embedId,
      order_index: v.order_index,
      is_active: v.is_active,
    }));
    await syncTable('terminal_commands', data.terminalCommands);

    console.log('\n✅ All local portfolio content successfully synchronized to Supabase cloud!');
  } catch (err) {
    console.error('Error during Supabase synchronization:', err);
    process.exitCode = 1;
  }
}

syncToSupabase();
