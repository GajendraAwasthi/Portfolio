import fs from 'fs';
import path from 'path';
import { initialPortfolioData } from '@/lib/default-data';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { PortfolioData } from '@/types/portfolio';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'portfolio-store.json');

// Helper to ensure data directory and file exist
function getLocalStoredData(): PortfolioData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...initialPortfolioData,
        ...parsed,
      };
    }
  } catch (error) {
    console.error('Error reading local portfolio store:', error);
  }
  return initialPortfolioData;
}

function saveLocalStoredData(data: PortfolioData): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving local portfolio store:', error);
  }
}

// Fetch all portfolio data
export async function getPortfolioData(): Promise<PortfolioData> {
  if (!isSupabaseConfigured()) {
    return getLocalStoredData();
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return getLocalStoredData();
  }

  try {
    const [
      settingsRes,
      profileRes,
      aboutRes,
      statsRes,
      eduRes,
      expRes,
      skillsRes,
      certsRes,
      projectsRes,
      videosRes,
      terminalRes,
    ] = await Promise.all([
      supabase.from('site_settings').select('*').limit(1).maybeSingle(),
      supabase.from('profile').select('*').limit(1).maybeSingle(),
      supabase.from('about_cards').select('*').order('order_index', { ascending: true }),
      supabase.from('stats').select('*').order('order_index', { ascending: true }),
      supabase.from('education').select('*').order('order_index', { ascending: true }),
      supabase.from('experience').select('*').order('order_index', { ascending: true }),
      supabase.from('skills').select('*').order('order_index', { ascending: true }),
      supabase.from('certifications').select('*').order('order_index', { ascending: true }),
      supabase.from('projects').select('*').order('order_index', { ascending: true }),
      supabase.from('videos').select('*').order('order_index', { ascending: true }),
      supabase.from('terminal_commands').select('*').order('order_index', { ascending: true }),
    ]);

    // Check if Supabase has data
    const local = getLocalStoredData();

    const settings = settingsRes.data ? {
      metaTitle: settingsRes.data.meta_title ?? local.settings.metaTitle,
      metaDescription: settingsRes.data.meta_description ?? local.settings.metaDescription,
      metaKeywords: settingsRes.data.meta_keywords ?? local.settings.metaKeywords,
      ogImage: settingsRes.data.og_image ?? local.settings.ogImage,
      favicon: settingsRes.data.favicon ?? local.settings.favicon,
      themeColor: settingsRes.data.theme_color ?? local.settings.themeColor,
      enableAudioEasterEgg: settingsRes.data.enable_audio_easter_egg ?? local.settings.enableAudioEasterEgg,
      mobileAudioSrc: settingsRes.data.mobile_audio_src ?? local.settings.mobileAudioSrc,
      desktopAudioSrc: settingsRes.data.desktop_audio_src ?? local.settings.desktopAudioSrc,
      attentionTitleBlink: settingsRes.data.attention_title_blink ?? local.settings.attentionTitleBlink,
      footerOwner: settingsRes.data.footer_owner ?? local.settings.footerOwner,
      footerTagline: settingsRes.data.footer_tagline ?? local.settings.footerTagline,
      footerSubtext: settingsRes.data.footer_subtext ?? local.settings.footerSubtext,
      lastUpdatedText: settingsRes.data.last_updated_text ?? local.settings.lastUpdatedText,
    } : local.settings;

    const profile = profileRes.data ? {
      name: profileRes.data.name ?? local.profile.name,
      surnameGradient: profileRes.data.surname_gradient ?? local.profile.surnameGradient,
      avatarUrl: profileRes.data.avatar_url ?? local.profile.avatarUrl,
      headlineTyping: profileRes.data.headline_typing ?? local.profile.headlineTyping,
      description: profileRes.data.description ?? local.profile.description,
      resumeUrl: profileRes.data.resume_url ?? local.profile.resumeUrl,
      contactEmail: profileRes.data.contact_email ?? local.profile.contactEmail,
      socialLinks: profileRes.data.social_links ?? local.profile.socialLinks,
      ctaButtons: profileRes.data.cta_buttons ?? local.profile.ctaButtons,
    } : local.profile;

    const aboutCards = (!aboutRes.error && Array.isArray(aboutRes.data)) ? aboutRes.data : local.aboutCards;
    const stats = (!statsRes.error && Array.isArray(statsRes.data)) ? statsRes.data : local.stats;
    const education = (!eduRes.error && Array.isArray(eduRes.data)) ? eduRes.data : local.education;
    const experience = (!expRes.error && Array.isArray(expRes.data)) ? expRes.data : local.experience;
    const skills = (!skillsRes.error && Array.isArray(skillsRes.data)) ? skillsRes.data : local.skills;
    const certifications = (!certsRes.error && Array.isArray(certsRes.data)) ? certsRes.data.map((c: any) => ({
      id: c.id,
      title: c.title,
      imageUrl: c.image_url,
      issuer: c.issuer,
      issueDate: c.issue_date,
      credentialUrl: c.credential_url,
      order_index: c.order_index,
      is_active: c.is_active,
    })) : local.certifications;

    const projects = (!projectsRes.error && Array.isArray(projectsRes.data)) ? projectsRes.data.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      team: p.team,
      tags: p.tags,
      githubUrl: p.github_url,
      liveUrl: p.live_url,
      imageUrl: p.image_url,
      order_index: p.order_index,
      is_active: p.is_active,
    })) : local.projects;

    const videos = (!videosRes.error && Array.isArray(videosRes.data)) ? videosRes.data.map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeUrl: v.youtube_url,
      embedId: v.embed_id,
      order_index: v.order_index,
      is_active: v.is_active,
    })) : local.videos;

    const terminalCommands = (!terminalRes.error && Array.isArray(terminalRes.data)) ? terminalRes.data : local.terminalCommands;

    return {
      settings,
      profile,
      aboutCards,
      stats,
      education,
      experience,
      skills,
      certifications,
      projects,
      videos,
      terminalCommands,
    };
  } catch (err) {
    console.error('Error fetching Supabase data, falling back to local:', err);
    return getLocalStoredData();
  }
}

// Save specific section data
export async function saveSectionData<K extends keyof PortfolioData>(
  section: K,
  payload: PortfolioData[K]
): Promise<{ success: boolean; message: string }> {
  // Always update local storage so changes persist locally regardless of cloud status
  const current = getLocalStoredData();
  current[section] = payload;
  saveLocalStoredData(current);

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      message: 'Saved to local store successfully. (Configure Supabase credentials in .env.local to persist in the cloud).',
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: true, message: 'Saved to local store (Supabase client not initialized).' };
  }

  try {
    switch (section) {
      case 'settings': {
        const s = payload as PortfolioData['settings'];
        await supabase.from('site_settings').upsert({
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
        break;
      }

      case 'profile': {
        const p = payload as PortfolioData['profile'];
        await supabase.from('profile').upsert({
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
        break;
      }

      case 'education': {
        const list = payload as PortfolioData['education'];
        const { error: delErr } = await supabase.from('education').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `edu-${Date.now()}-${idx}`,
            degree: item.degree || '',
            institution: item.institution || '',
            timeline: item.timeline || '',
            stream: item.stream || null,
            description: item.description || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('education').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'experience': {
        const list = payload as PortfolioData['experience'];
        const { error: delErr } = await supabase.from('experience').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `exp-${Date.now()}-${idx}`,
            role: item.role || '',
            company: item.company || '',
            duration: item.duration || '',
            description: item.description || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('experience').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'skills': {
        const list = payload as PortfolioData['skills'];
        const { error: delErr } = await supabase.from('skills').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `sk-${Date.now()}-${idx}`,
            name: item.name || '',
            percentage: Number(item.percentage) || 0,
            category: item.category || 'General',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('skills').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'certifications': {
        const list = payload as PortfolioData['certifications'];
        const { error: delErr } = await supabase.from('certifications').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((c, idx) => ({
            id: c.id || `cert-${Date.now()}-${idx}`,
            title: c.title || '',
            image_url: c.imageUrl || '',
            issuer: c.issuer || null,
            issue_date: c.issueDate || null,
            credential_url: c.credentialUrl || null,
            order_index: c.order_index ?? idx + 1,
            is_active: c.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('certifications').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'projects': {
        const list = payload as PortfolioData['projects'];
        const { error: delErr } = await supabase.from('projects').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((p, idx) => ({
            id: p.id || `proj-${Date.now()}-${idx}`,
            title: p.title || '',
            description: p.description || '',
            team: p.team || null,
            tags: Array.isArray(p.tags) ? p.tags : [],
            github_url: p.githubUrl || null,
            live_url: p.liveUrl || null,
            image_url: p.imageUrl || null,
            order_index: p.order_index ?? idx + 1,
            is_active: p.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('projects').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'videos': {
        const list = payload as PortfolioData['videos'];
        const { error: delErr } = await supabase.from('videos').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((v, idx) => ({
            id: v.id || `vid-${Date.now()}-${idx}`,
            title: v.title || '',
            description: v.description || '',
            youtube_url: v.youtubeUrl || '',
            embed_id: v.embedId || '',
            order_index: v.order_index ?? idx + 1,
            is_active: v.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('videos').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'aboutCards': {
        const list = payload as PortfolioData['aboutCards'];
        const { error: delErr } = await supabase.from('about_cards').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `about-${Date.now()}-${idx}`,
            icon: item.icon || '📌',
            title: item.title || '',
            description: item.description || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('about_cards').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'stats': {
        const list = payload as PortfolioData['stats'];
        const { error: delErr } = await supabase.from('stats').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `stat-${Date.now()}-${idx}`,
            target_number: Number(item.target_number) || 0,
            suffix: item.suffix || '',
            label: item.label || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('stats').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }

      case 'terminalCommands': {
        const list = payload as PortfolioData['terminalCommands'];
        const { error: delErr } = await supabase.from('terminal_commands').delete().neq('id', '__dummy__');
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `cmd-${Date.now()}-${idx}`,
            command: item.command || '',
            output: item.output || '',
            description: item.description || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          const { error: insErr } = await supabase.from('terminal_commands').insert(mapped);
          if (insErr) throw new Error(`Insert failed: ${insErr.message}`);
        }
        break;
      }
    }

    return { success: true, message: `Updated ${section} in Supabase and local store!` };
  } catch (err: any) {
    console.error(`Error saving ${section} to Supabase:`, err);
    return {
      success: false,
      message: `Failed to save ${section} to Supabase: ${err.message || err}`,
    };
  }
}

// Sync all current data to Supabase (1-click Cloud Push)
export async function syncSeedToSupabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase URL and Key are not configured in environment variables.',
    };
  }

  const data = getLocalStoredData();
  const sections: (keyof PortfolioData)[] = [
    'settings',
    'profile',
    'aboutCards',
    'stats',
    'education',
    'experience',
    'skills',
    'certifications',
    'projects',
    'videos',
    'terminalCommands',
  ];

  for (const section of sections) {
    await saveSectionData(section, data[section]);
  }

  return {
    success: true,
    message: 'Successfully synchronized all portfolio elements & settings to Supabase!',
  };
}

// Connection test helper
export async function checkSupabaseStatus() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      connected: false,
      tablesExist: false,
      message: 'Supabase is not configured yet. Using local persistent store.',
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      configured: true,
      connected: false,
      tablesExist: false,
      message: 'Supabase credentials found but client initialization failed.',
    };
  }

  try {
    const { data, error } = await supabase.from('site_settings').select('id').limit(1);
    if (error) {
      return {
        configured: true,
        connected: true,
        tablesExist: false,
        message: `Connected to Supabase, but tables need to be created: ${error.message}. Run supabase/schema.sql in the Supabase SQL editor.`,
      };
    }

    return {
      configured: true,
      connected: true,
      tablesExist: true,
      message: 'Connected to Supabase database successfully! All tables ready.',
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      tablesExist: false,
      message: `Failed to connect to Supabase: ${err.message}`,
    };
  }
}
