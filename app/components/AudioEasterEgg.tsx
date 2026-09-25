'use client';

import { useEffect, useRef } from 'react';
import { SiteSettings } from '@/types/portfolio';

interface AudioEasterEggProps {
  settings: SiteSettings;
}

export default function AudioEasterEgg({ settings }: AudioEasterEggProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastShakeAt = useRef<number>(0);
  const lastLevel = useRef<number>(0);

  // Tab Title attention rotation
  useEffect(() => {
    if (!settings.attentionTitleBlink) return;

    let timer: NodeJS.Timeout;
    let isBlinking = false;
    const baseTitle = document.title;

    const handleVisibility = () => {
      if (document.hidden) {
        timer = setInterval(() => {
          isBlinking = !isBlinking;
          document.title = isBlinking
            ? 'Wait ! You Missed Something ⚠️'
            : 'You missed chance to hire me 🫣';
        }, 1800);
      } else {
        clearInterval(timer);
        document.title = baseTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [settings.attentionTitleBlink]);

  // Mobile Device Shake sound easter egg
  useEffect(() => {
    if (!settings.enableAudioEasterEgg) return;

    const audio = new Audio(settings.mobileAudioSrc || '/src/tismarmobile.MP3');
    audioRef.current = audio;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const level = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      const delta = Math.abs(level - lastLevel.current);
      lastLevel.current = level;

      const now = Date.now();
      if (delta > 8 && now - lastShakeAt.current > 600) {
        lastShakeAt.current = now;
        try {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } catch {
          // Ignore autoplay restriction before user interaction
        }
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion as any, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion as any);
      }
    };
  }, [settings.enableAudioEasterEgg, settings.mobileAudioSrc]);

  return null;
}
