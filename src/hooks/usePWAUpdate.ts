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
 * - Checks Service Worker updates + /version.json (NetworkOnly / cache: 'no-store') on boot,
 *   focus, visibilitychange, online recovery, and every 60s.
 * - Never deletes or overwrites IndexedDB / Firestore / localStorage data.
 * - Activates the waiting Service Worker cleanly only after user clicks "Update Now".
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

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    isCheckingRef.current = true;
    let foundUpdate = false;

    try {
      // 1. Trigger standard Service Worker byte-for-byte check on server
      if (registrationRef.current) {
        await registrationRef.current.update().catch(() => {});
        if (registrationRef.current.waiting) {
          foundUpdate = true;
        }
      }

      // 2. Also probe /version.json directly from network (never cached) to catch new Vercel deploys
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

            // Ask SW to fetch any updated assets if not already waiting
            if (registrationRef.current) {
              await registrationRef.current.update().catch(() => {});
            }
          }
        }
      }
    } catch {
      // Network might be temporarily unreachable; ignore silently
    } finally {
      isCheckingRef.current = false;
    }

    return foundUpdate;
  }, [currentVersion]);

  // Run initial check and re-check on focus, tab visibility, reconnect, and interval
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

  // If SW just notified needRefresh, make sure banner is visible
  useEffect(() => {
    if (needRefresh) {
      setIsDismissed(false);
    }
  }, [needRefresh]);

  const applyUpdate = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    const safeReload = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };

    try {
      // Listen for the new service worker taking control before reloading
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', safeReload, { once: true });
      }

      const reg = registrationRef.current;

      // Refresh registration first if no waiting worker yet
      if (reg && !reg.waiting) {
        await reg.update().catch(() => {});
      }

      if (needRefresh || reg?.waiting) {
        await updateServiceWorker(true);
      } else {
        // Fallback when update was detected via /version.json before SW entered waiting state:
        // Clear static CacheStorage asset caches ONLY (never touch IndexedDB / Firestore / localStorage)
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys
              .filter((key) => !key.includes('firestore') && !key.includes('firebase'))
              .map((key) => caches.delete(key))
          );
        }
        if (reg) {
          await reg.update().catch(() => {});
        }
        safeReload();
        return;
      }

      // Safety fallback reload in case controllerchange does not fire promptly
      window.setTimeout(safeReload, 2500);
    } catch (error) {
      console.warn('PWA update activation fallback reload:', error);
      safeReload();
    }
  }, [isUpdating, needRefresh, updateServiceWorker]);

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
