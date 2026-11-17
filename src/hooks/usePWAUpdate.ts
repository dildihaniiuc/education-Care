import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const VERSION_CHECK_INTERVAL_MS = 60 * 1000;

interface VersionManifest {
  version: string;
  builtAt?: string;
}

export interface PWAUpdateState {
  updateAvailable: boolean;
  remoteVersion: string | null;
  currentVersion: string;
  isUpdating: boolean;
  isDismissed: boolean;
  offlineReady: boolean;
  applyUpdate: () => Promise<void>;
  dismissBanner: () => void;
  reopenBanner: () => void;
  checkForUpdate: () => Promise<boolean>;
}

/**
 * Reliable PWA update detection & user-confirmed activation hook.
 * - Detects updates via Service Worker waiting state AND network-only /version.json probe.
 * - Handles stalled/broken older SW installations cleanly by unregistering stale SW & purging
 *   only static CacheStorage caches (never touching IndexedDB / Firestore / localStorage).
 * - Uses cache-busted navigation replacement on reload so standalone PWAs never reload stale HTML.
 */
export function usePWAUpdate(): PWAUpdateState {
  const currentVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const reloadingRef = useRef(false);
  const isCheckingRef = useRef(false);

  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [hasRemoteVersionMismatch, setHasRemoteVersionMismatch] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        registrationRef.current = registration;
      }
    },
    onRegisterError(error) {
      console.warn('Service worker registration error:', error);
    },
  });

  // Clean temporary cache-buster query param after reload completes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('_pwa_u')) {
        url.searchParams.delete('_pwa_u');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch {
      // ignore
    }
  }, []);

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    isCheckingRef.current = true;
    let foundUpdate = false;

    try {
      let reg = registrationRef.current;
      if (!reg && 'serviceWorker' in navigator) {
        reg = (await navigator.serviceWorker.getRegistration().catch(() => undefined)) || null;
        if (reg) registrationRef.current = reg;
      }

      if (reg) {
        await reg.update().catch(() => {});
        if (reg.waiting) {
          foundUpdate = true;
        }
      }

      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = (await response.json()) as Partial<VersionManifest>;
          if (data?.version && data.version !== currentVersion) {
            setRemoteVersion((prev) => {
              if (prev !== data.version) {
                setIsDismissed(false);
              }
              return data.version || null;
            });
            setHasRemoteVersionMismatch(true);
            foundUpdate = true;

            if (reg) {
              await reg.update().catch(() => {});
            }
          }
        }
      }
    } catch {
      // Network temporarily unavailable; keep current state quietly
    } finally {
      isCheckingRef.current = false;
    }

    return foundUpdate;
  }, [currentVersion]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void checkForUpdate();
    }, 1500);

    const intervalId = window.setInterval(() => {
      void checkForUpdate();
    }, VERSION_CHECK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate();
      }
    };

    const handleFocus = () => {
      void checkForUpdate();
    };

    const handleOnline = () => {
      void checkForUpdate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdate]);

  useEffect(() => {
    if (needRefresh) {
      setIsDismissed(false);
    }
  }, [needRefresh]);

  const applyUpdate = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    const reloadFresh = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('_pwa_u', remoteVersion || String(Date.now()));
        window.location.replace(url.toString());
      } catch {
        window.location.reload();
      }
    };

    const clearStaticCachesOnly = async () => {
      if (!('caches' in window)) return;
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => !key.includes('firestore') && !key.includes('firebase'))
            .map((key) => caches.delete(key))
        );
      } catch {
        // ignore cache delete errors
      }
    };

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', reloadFresh, { once: true });
      }

      let reg = registrationRef.current;
      if (!reg && 'serviceWorker' in navigator) {
        reg = (await navigator.serviceWorker.getRegistration().catch(() => undefined)) || null;
        if (reg) registrationRef.current = reg;
      }

      if (reg && !reg.waiting) {
        await reg.update().catch(() => {});

        // If a new SW is actively installing right now, wait briefly for it to reach waiting state
        if (reg.installing) {
          await new Promise<void>((resolve) => {
            const installing = reg!.installing!;
            const timeout = window.setTimeout(resolve, 4000);
            installing.addEventListener('statechange', () => {
              if (installing.state === 'installed' || installing.state === 'redundant') {
                window.clearTimeout(timeout);
                resolve();
              }
            });
          });
        }
      }

      if (reg?.waiting) {
        // Send SKIP_WAITING directly and also invoke workbox-window update helper
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        await updateServiceWorker(true).catch(() => {});
        window.setTimeout(reloadFresh, 1800);
        return;
      }

      if (needRefresh) {
        await updateServiceWorker(true).catch(() => {});
        window.setTimeout(reloadFresh, 1800);
        return;
      }

      // No waiting SW found despite version mismatch (e.g., older/broken SW or HTTP-cached HTML):
      // Unregister stale SW if present, clear only static CacheStorage, and force fresh navigation
      if (reg) {
        await reg.unregister().catch(() => {});
      }
      await clearStaticCachesOnly();
      reloadFresh();
    } catch (error) {
      console.warn('PWA update activation fallback:', error);
      await clearStaticCachesOnly();
      reloadFresh();
    }
  }, [isUpdating, needRefresh, remoteVersion, updateServiceWorker]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const reopenBanner = useCallback(() => {
    setIsDismissed(false);
  }, []);

  return {
    updateAvailable: needRefresh || hasRemoteVersionMismatch,
    remoteVersion,
    currentVersion,
    isUpdating,
    isDismissed,
    offlineReady,
    applyUpdate,
    dismissBanner,
    reopenBanner,
    checkForUpdate,
  };
}
