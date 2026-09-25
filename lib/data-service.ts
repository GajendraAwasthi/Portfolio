import 'server-only';
import fs from 'fs';
import path from 'path';
import { initialPortfolioData } from '@/lib/default-data';
import { getSupabaseAdmin, isSupabaseConfigured, isSupabaseRequested } from '@/lib/supabase';
import { PortfolioData } from '@/types/portfolio';
import { safeEmailAddress, safeExternalUrl, safeMediaUrl } from '@/lib/validate-content';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'portfolio-store.json');

export function visiblePortfolioData(data: PortfolioData): PortfolioData {
  return {
    ...data,
    aboutCards: data.aboutCards.filter((item) => item.is_active),
    stats: data.stats.filter((item) => item.is_active),
    education: data.education.filter((item) => item.is_active),
    experience: data.experience.filter((item) => item.is_active),
    skills: data.skills.filter((item) => item.is_active),
    certifications: data.certifications.filter((item) => item.is_active),
    projects: data.projects.filter((item) => item.is_active),
    videos: data.videos.filter((item) => item.is_active),
    terminalCommands: data.terminalCommands.filter((item) => item.is_active),
  };
}

function sanitizePublicUrls(data: PortfolioData): PortfolioData {
  const social = data.profile.socialLinks || {};
  return {
    ...data,
    settings: {
      ...data.settings,
      ogImage: safeMediaUrl(data.settings.ogImage),
      favicon: safeMediaUrl(data.settings.favicon),
      mobileAudioSrc: safeMediaUrl(data.settings.mobileAudioSrc),
      desktopAudioSrc: safeMediaUrl(data.settings.desktopAudioSrc),
    },
    profile: {
      ...data.profile,
      avatarUrl: safeMediaUrl(data.profile.avatarUrl),
      resumeUrl: safeMediaUrl(data.profile.resumeUrl),
      contactEmail: safeEmailAddress(data.profile.contactEmail),
      socialLinks: {
        ...social,
        linkedin: safeExternalUrl(social.linkedin), github: safeExternalUrl(social.github),
        tryhackme: safeExternalUrl(social.tryhackme), facebook: safeExternalUrl(social.facebook),
        twitter: safeExternalUrl(social.twitter),
        email: safeEmailAddress(social.email),
      },
    },
    certifications: data.certifications.map((c) => ({
      ...c, imageUrl: safeMediaUrl(c.imageUrl), credentialUrl: safeExternalUrl(c.credentialUrl),
    })),
    projects: data.projects.map((p) => ({
      ...p, githubUrl: safeExternalUrl(p.githubUrl), liveUrl: safeExternalUrl(p.liveUrl),
      imageUrl: safeMediaUrl(p.imageUrl),
    })),
    videos: data.videos.map((v) => ({
      ...v, youtubeUrl: safeExternalUrl(v.youtubeUrl),
      embedId: /^[a-zA-Z0-9_-]{11}$/.test(v.embedId) ? v.embedId : '',
      is_active: v.is_active && /^[a-zA-Z0-9_-]{11}$/.test(v.embedId),
    })),
  };
}

// Helper to ensure data directory and file exist
function getLocalStoredData(): PortfolioData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return sanitizePublicUrls({
        ...initialPortfolioData,
        ...parsed,
      });
    }
  } catch (error) {
    console.error('Error reading local portfolio store:', error);
  }
  return sanitizePublicUrls(initialPortfolioData);
}

function saveLocalStoredData(data: PortfolioData): void {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const temporary = `${DATA_FILE_PATH}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(temporary, DATA_FILE_PATH);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

async function replaceRows(table: string, rows: { id: string }[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not configured');
  if (rows.length) {
    const { error } = await supabase.from(table).upsert(rows);
    if (error) throw error;
  }
  // Upsert first: failed inserts must never erase the previously published section.
  const deletion = rows.length
    ? supabase.from(table).delete().not('id', 'in', `(${rows.map((row) => row.id).join(',')})`)
    : supabase.from(table).delete().neq('id', '__dummy__');
  const { error } = await deletion;
  if (error) throw error;
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

    return sanitizePublicUrls({
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
    });
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
  if (!isSupabaseConfigured()) {
    if (isSupabaseRequested()) return { success: false, message: 'Supabase configuration is incomplete.' };
    try {
      const current = getLocalStoredData();
      current[section] = payload;
      saveLocalStoredData(current);
    } catch (error) {
      console.error('Local content write failed:', error);
      return { success: false, message: 'Local content could not be saved.' };
    }
    return {
      success: true,
      message: 'Saved to local store successfully. (Configure Supabase credentials in .env.local to persist in the cloud).',
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, message: 'Supabase client is unavailable.' };
  }

  try {
    switch (section) {
      case 'settings': {
        const s = payload as PortfolioData['settings'];
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
        break;
      }

      case 'profile': {
        const p = payload as PortfolioData['profile'];
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
        break;
      }

      case 'education': {
        const list = payload as PortfolioData['education'];
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
          await replaceRows('education', mapped);
        } else {
          await replaceRows('education', []);
        }
        break;
      }

      case 'experience': {
        const list = payload as PortfolioData['experience'];
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
          await replaceRows('experience', mapped);
        } else {
          await replaceRows('experience', []);
        }
        break;
      }

      case 'skills': {
        const list = payload as PortfolioData['skills'];
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `sk-${Date.now()}-${idx}`,
            name: item.name || '',
            percentage: Number(item.percentage) || 0,
            category: item.category || 'General',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          await replaceRows('skills', mapped);
        } else {
          await replaceRows('skills', []);
        }
        break;
      }

      case 'certifications': {
        const list = payload as PortfolioData['certifications'];
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
          await replaceRows('certifications', mapped);
        } else {
          await replaceRows('certifications', []);
        }
        break;
      }

      case 'projects': {
        const list = payload as PortfolioData['projects'];
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
          await replaceRows('projects', mapped);
        } else {
          await replaceRows('projects', []);
        }
        break;
      }

      case 'videos': {
        const list = payload as PortfolioData['videos'];
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
          await replaceRows('videos', mapped);
        } else {
          await replaceRows('videos', []);
        }
        break;
      }

      case 'aboutCards': {
        const list = payload as PortfolioData['aboutCards'];
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `about-${Date.now()}-${idx}`,
            icon: item.icon || '📌',
            title: item.title || '',
            description: item.description || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          await replaceRows('about_cards', mapped);
        } else {
          await replaceRows('about_cards', []);
        }
        break;
      }

      case 'stats': {
        const list = payload as PortfolioData['stats'];
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `stat-${Date.now()}-${idx}`,
            target_number: Number(item.target_number) || 0,
            suffix: item.suffix || '',
            label: item.label || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          await replaceRows('stats', mapped);
        } else {
          await replaceRows('stats', []);
        }
        break;
      }

      case 'terminalCommands': {
        const list = payload as PortfolioData['terminalCommands'];
        if (list && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item.id || `cmd-${Date.now()}-${idx}`,
            command: item.command || '',
            output: item.output || '',
            description: item.description || '',
            order_index: item.order_index ?? idx + 1,
            is_active: item.is_active ?? true,
          }));
          await replaceRows('terminal_commands', mapped);
        } else {
          await replaceRows('terminal_commands', []);
        }
        break;
      }
    }

    // The database is authoritative in cloud mode. A local backup is best effort.
    try {
      const current = getLocalStoredData();
      current[section] = payload;
      saveLocalStoredData(current);
    } catch (error) {
      console.warn('Local content backup failed:', error);
    }
    return { success: true, message: `Updated ${section} in Supabase!` };
  } catch (err: any) {
    console.error(`Error saving ${section} to Supabase:`, err);
    return {
      success: false,
      message: `Failed to save ${section} to Supabase. Existing content was preserved where possible.`,
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
    const result = await saveSectionData(section, data[section]);
    if (!result.success) return result;
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
