import type { PortfolioData } from '@/types/portfolio';

type Field = 'text' | 'number' | 'boolean' | 'url' | 'media' | 'email' | 'id' | 'videoId' | 'strings' | 'socialLinks' | 'ctaButtons';
type Shape = Record<string, Field | `${Field}?`>;

const shapes: Record<keyof PortfolioData, Shape> = {
  settings: {
    id: 'id?', metaTitle: 'text', metaDescription: 'text', metaKeywords: 'text', ogImage: 'media',
    favicon: 'media', themeColor: 'text', enableAudioEasterEgg: 'boolean', mobileAudioSrc: 'media',
    desktopAudioSrc: 'media', attentionTitleBlink: 'boolean', footerOwner: 'text', footerTagline: 'text',
    footerSubtext: 'text', lastUpdatedText: 'text',
  },
  profile: {
    id: 'id?', name: 'text', surnameGradient: 'text', avatarUrl: 'media', headlineTyping: 'strings',
    description: 'text', resumeUrl: 'media', contactEmail: 'email', socialLinks: 'socialLinks', ctaButtons: 'ctaButtons',
  },
  aboutCards: { id: 'id', icon: 'text', title: 'text', description: 'text', order_index: 'number', is_active: 'boolean' },
  stats: { id: 'id', target_number: 'number', suffix: 'text', label: 'text', order_index: 'number', is_active: 'boolean' },
  education: { id: 'id', degree: 'text', institution: 'text', timeline: 'text', stream: 'text?', description: 'text', order_index: 'number', is_active: 'boolean' },
  experience: { id: 'id', role: 'text', company: 'text', duration: 'text', description: 'text', order_index: 'number', is_active: 'boolean' },
  skills: { id: 'id', name: 'text', percentage: 'number', category: 'text', order_index: 'number', is_active: 'boolean' },
  certifications: { id: 'id', title: 'text', imageUrl: 'media', issuer: 'text?', issueDate: 'text?', credentialUrl: 'url?', order_index: 'number', is_active: 'boolean' },
  projects: { id: 'id', title: 'text', description: 'text', team: 'text?', tags: 'strings', githubUrl: 'url?', liveUrl: 'url?', imageUrl: 'media?', order_index: 'number', is_active: 'boolean' },
  videos: { id: 'id', title: 'text', description: 'text?', youtubeUrl: 'url', embedId: 'videoId', order_index: 'number', is_active: 'boolean' },
  terminalCommands: { id: 'id', command: 'text', output: 'text', description: 'text?', order_index: 'number', is_active: 'boolean' },
};

const socialShape: Shape = {
  linkedin: 'url?', github: 'url?', tryhackme: 'url?', facebook: 'url?', twitter: 'url?', email: 'email?',
};
const ctaShape: Shape = {
  viewWorkText: 'text', viewWorkTarget: 'id', terminalButtonText: 'text', resumeButtonText: 'text',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function safeExternalUrl(value: unknown): string {
  return typeof value === 'string' && isHttpUrl(value) ? value : '';
}

export function safeMediaUrl(value: unknown): string {
  return typeof value === 'string' && (
    isHttpUrl(value) || (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'))
  ) ? value : '';
}

export function safeEmailAddress(value: unknown): string {
  return typeof value === 'string' && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value) ? value : '';
}

function validField(value: unknown, type: Field): boolean {
  if (type === 'socialLinks') return validShape(value, socialShape);
  if (type === 'ctaButtons') return validShape(value, ctaShape);
  if (type === 'strings') return Array.isArray(value) && value.length <= 30 && value.every((item) => typeof item === 'string' && item.length <= 500);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'number') return typeof value === 'number' && Number.isInteger(value) && Math.abs(value) <= 1_000_000;
  if (typeof value !== 'string' || value.length > 5000) return false;
  if (type === 'id') return /^[a-zA-Z0-9_-]{1,128}$/.test(value);
  if (type === 'videoId') return /^[a-zA-Z0-9_-]{11}$/.test(value);
  if (type === 'email') return value === '' || safeEmailAddress(value) === value;
  if (type === 'url') return value === '' || isHttpUrl(value);
  if (type === 'media') return value === '' || isHttpUrl(value) || (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'));
  return true;
}

function validShape(value: unknown, shape: Shape): boolean {
  if (!isRecord(value)) return false;
  if (Object.keys(value).some((key) => !(key in shape) && key !== 'created_at' && key !== 'updated_at')) return false;
  if (value.created_at !== undefined && !validField(value.created_at, 'text')) return false;
  if (value.updated_at !== undefined && !validField(value.updated_at, 'text')) return false;
  return Object.entries(shape).every(([key, spec]) => {
    const optional = spec.endsWith('?');
    const field = value[key];
    if (optional && (field === undefined || field === null)) return true;
    return field !== undefined && validField(field, (optional ? spec.slice(0, -1) : spec) as Field);
  });
}

export function isValidSectionData(section: keyof PortfolioData, value: unknown): boolean {
  if (section === 'settings' || section === 'profile') return validShape(value, shapes[section]);
  if (!Array.isArray(value) || value.length > 200) return false;
  const seen = new Set<string>();
  return value.every((item) => {
    if (!validShape(item, shapes[section])) return false;
    const id = (item as { id: string }).id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
