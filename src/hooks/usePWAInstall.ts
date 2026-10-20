import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSamsung, setIsSamsung] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect standalone mode (already installed on phone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // 2. Detect User Agents & Environments
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const isSamsungBrowser = /samsungbrowser/.test(ua);
    setIsSamsung(isSamsungBrowser);

    // Detect in-app webviews (WhatsApp, Facebook, Messenger, Instagram, Telegram)
    const inApp =
      /fbav|fban|instagram|whatsapp|telegram|line|wv|webview/.test(ua) ||
      (/android/.test(ua) && /version\/[0-9.]+/i.test(ua) && !/chrome\/[0-9.]+/i.test(ua));
    setIsInAppBrowser(inApp);

    // 3. Listen for Chrome / Android native install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallSuccess(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Install prompt error:', err);
      return false;
    }
  };

  const copyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } catch {
      return false;
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'النظام الداخلي الموحد - ثانوية ابن الهيثم التقنية 2026/2027',
          text: 'بوابة النظام الداخلي الموحد (55 مادة - 9 فصول) مع ملخصات وخطب المشرف ش. رشيد واستمارة التعهد.',
          url: window.location.href,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isSamsung,
    isInAppBrowser,
    installSuccess,
    triggerInstall,
    copyAppUrl,
    shareApp,
  };
}
