import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Shared module-level store so deferredPrompt survives route/auth transitions
// and catches events captured before React mounts.
let sharedDeferredPrompt: BeforeInstallPromptEvent | null =
  typeof window !== 'undefined' ? window.__deferredInstallPrompt || null : null;
let sharedIsInstalled = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

function checkStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

if (typeof window !== 'undefined') {
  sharedIsInstalled = checkStandaloneMode();

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;
    sharedDeferredPrompt = promptEvent;
    window.__deferredInstallPrompt = promptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    sharedIsInstalled = true;
    sharedDeferredPrompt = null;
    window.__deferredInstallPrompt = null;
    notifyListeners();
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => sharedDeferredPrompt || (typeof window !== 'undefined' ? window.__deferredInstallPrompt || null : null)
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => sharedIsInstalled || checkStandaloneMode());
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Pick up any event that fired before React hydrated
    if (window.__deferredInstallPrompt && !sharedDeferredPrompt) {
      sharedDeferredPrompt = window.__deferredInstallPrompt;
    }
    setDeferredPrompt(sharedDeferredPrompt);
    setIsInstalled(sharedIsInstalled || checkStandaloneMode());

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    const handleSync = () => {
      setDeferredPrompt(sharedDeferredPrompt);
      setIsInstalled(sharedIsInstalled || checkStandaloneMode());
    };

    listeners.add(handleSync);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        sharedIsInstalled = true;
        handleSync();
      }
    };
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      listeners.delete(handleSync);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    const promptToUse = sharedDeferredPrompt || window.__deferredInstallPrompt || deferredPrompt;
    if (!promptToUse) return false;

    await promptToUse.prompt();
    const { outcome } = await promptToUse.userChoice;
    if (outcome === 'accepted') {
      sharedIsInstalled = true;
      sharedDeferredPrompt = null;
      window.__deferredInstallPrompt = null;
      notifyListeners();
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    install,
  };
}
