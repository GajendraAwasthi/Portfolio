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

    const aboutCards = (aboutRes.data && aboutRes.data.length > 0) ? aboutRes.data : local.aboutCards;
    const stats = (statsRes.data && statsRes.data.length > 0) ? statsRes.data : local.stats;
    const education = (eduRes.data && eduRes.data.length > 0) ? eduRes.data : local.education;
    const experience = (expRes.data && expRes.data.length > 0) ? expRes.data : local.experience;
    const skills = (skillsRes.data && skillsRes.data.length > 0) ? skillsRes.data : local.skills;
    const certifications = (certsRes.data && certsRes.data.length > 0) ? certsRes.data.map((c: any) => ({
      id: c.id,
      title: c.title,
      imageUrl: c.image_url,
      issuer: c.issuer,
      issueDate: c.issue_date,
      credentialUrl: c.credential_url,
      order_index: c.order_index,
      is_active: c.is_active,
    })) : local.certifications;

    const projects = (projectsRes.data && projectsRes.data.length > 0) ? projectsRes.data.map((p: any) => ({
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

    const videos = (videosRes.data && videosRes.data.length > 0) ? videosRes.data.map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeUrl: v.youtube_url,
      embedId: v.embed_id,
      order_index: v.order_index,
      is_active: v.is_active,
    })) : local.videos;

    const terminalCommands = (terminalRes.data && terminalRes.data.length > 0) ? terminalRes.data : local.terminalCommands;

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
        await supabase.from('education').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          await supabase.from('education').insert(list);
        }
        break;
      }

      case 'experience': {
        const list = payload as PortfolioData['experience'];
        await supabase.from('experience').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          await supabase.from('experience').insert(list);
        }
        break;
      }

      case 'skills': {
        const list = payload as PortfolioData['skills'];
        await supabase.from('skills').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          await supabase.from('skills').insert(list);
        }
        break;
      }

      case 'certifications': {
        const list = payload as PortfolioData['certifications'];
        await supabase.from('certifications').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          const mapped = list.map((c) => ({
            id: c.id,
            title: c.title,
            image_url: c.imageUrl,
            issuer: c.issuer,
            issue_date: c.issueDate,
            credential_url: c.credentialUrl,
            order_index: c.order_index,
            is_active: c.is_active,
          }));
          await supabase.from('certifications').insert(mapped);
        }
        break;
      }

      case 'projects': {
        const list = payload as PortfolioData['projects'];
        await supabase.from('projects').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          const mapped = list.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            team: p.team,
            tags: p.tags,
            github_url: p.githubUrl,
            live_url: p.liveUrl,
            image_url: p.imageUrl,
            order_index: p.order_index,
            is_active: p.is_active,
          }));
          await supabase.from('projects').insert(mapped);
        }
        break;
      }

      case 'videos': {
        const list = payload as PortfolioData['videos'];
        await supabase.from('videos').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          const mapped = list.map((v) => ({
            id: v.id,
            title: v.title,
            description: v.description,
            youtube_url: v.youtubeUrl,
            embed_id: v.embedId,
            order_index: v.order_index,
            is_active: v.is_active,
          }));
          await supabase.from('videos').insert(mapped);
        }
        break;
      }

      case 'aboutCards': {
        const list = payload as PortfolioData['aboutCards'];
        await supabase.from('about_cards').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          await supabase.from('about_cards').insert(list);
        }
        break;
      }

      case 'stats': {
        const list = payload as PortfolioData['stats'];
        await supabase.from('stats').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          await supabase.from('stats').insert(list);
        }
        break;
      }

      case 'terminalCommands': {
        const list = payload as PortfolioData['terminalCommands'];
        await supabase.from('terminal_commands').delete().neq('id', '__dummy__');
        if (list.length > 0) {
          await supabase.from('terminal_commands').insert(list);
        }
        break;
      }
    }

    return { success: true, message: `Updated ${section} in Supabase and local store!` };
  } catch (err: any) {
    console.error(`Error saving ${section} to Supabase:`, err);
    return {
      success: true,
      message: `Saved locally. Supabase write error: ${err.message || err}`,
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
