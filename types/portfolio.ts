export interface ProfileHero {
  id?: string;
  name: string;
  surnameGradient: string;
  avatarUrl: string;
  headlineTyping: string[];
  description: string;
  resumeUrl: string;
  contactEmail: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    tryhackme?: string;
    facebook?: string;
    email?: string;
    twitter?: string;
  };
  ctaButtons: {
    viewWorkText: string;
    viewWorkTarget: string;
    terminalButtonText: string;
    resumeButtonText: string;
  };
}

export interface AboutCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export interface StatCounter {
  id: string;
  target_number: number;
  suffix: string;
  label: string;
  order_index: number;
  is_active: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  timeline: string;
  stream?: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  percentage: number;
  category: 'Programming' | 'Design Tools' | 'Soft Skills' | string;
  order_index: number;
  is_active: boolean;
}

export interface CertificationItem {
  id: string;
  title: string;
  imageUrl: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
  order_index: number;
  is_active: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  team?: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  order_index: number;
  is_active: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  embedId: string;
  order_index: number;
  is_active: boolean;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export interface SiteSettings {
  id?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  favicon: string;
  themeColor: string;
  enableAudioEasterEgg: boolean;
  mobileAudioSrc: string;
  desktopAudioSrc: string;
  attentionTitleBlink: boolean;
  footerOwner: string;
  footerTagline: string;
  footerSubtext: string;
  lastUpdatedText: string;
}

export interface PortfolioData {
  profile: ProfileHero;
  aboutCards: AboutCard[];
  stats: StatCounter[];
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  videos: VideoItem[];
  terminalCommands: TerminalCommand[];
  settings: SiteSettings;
}
