import { useCallback, useEffect, useRef, useState } from 'react';

const VERSION_CHECK_INTERVAL_MS = 60 * 1000;
const INSTALL_WAIT_TIMEOUT_MS = 15 * 1000;
const CONTROLLER_CHANGE_TIMEOUT_MS = 3 * 1000;
const STUCK_RECOVERY_TIMEOUT_MS = 18 * 1000;

interface VersionManifest {
  version: string;
  builtAt?: string;
}

export interface PWAUpdateState {
  updateAvailable: boolean;
  remoteVersion: string | null;
  currentVersion: string;
  isUpdating: boolean;
  updateError: string | null;
  isDismissed: boolean;
  offlineReady: boolean;
  applyUpdate: () => Promise<void>;
  dismissBanner: () => void;
  reopenBanner: () => void;
  checkForUpdate: () => Promise<boolean>;
}

/**
 * Reliable single-owner PWA update detection & user-confirmed activation hook.
 * - Directly manages Service Worker registration with `updateViaCache: 'none'` (no dual-reload races).
 * - Detects updates via SW waiting/updatefound lifecycle AND network-only `/version.json` checks.
 * - Waits safely for in-flight SW precache installs before activating via `SKIP_WAITING`.
 * - Falls back cleanly by unregistering broken/stale SWs and purging only static CacheStorage caches
 *   (strictly preserving IndexedDB, localStorage, and all Firestore/Firebase data).
 */
export function usePWAUpdate(): PWAUpdateState {
  const currentVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const reloadingRef = useRef(false);
  const userConfirmedUpdateRef = useRef(false);
  const isCheckingRef = useRef(false);

  const [hasWaitingSW, setHasWaitingSW] = useState(false);
  const [hasRemoteVersionMismatch, setHasRemoteVersionMismatch] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Strip temporary cache-buster param cleanly after reload completes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('_pwa_u')) {
        url.searchParams.delete('_pwa_u');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch {
      // ignore URL errors
    }
  }, []);

  const performCleanReload = useCallback(
    (versionTag?: string | null) => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('_pwa_u', versionTag || remoteVersion || String(Date.now()));
        window.location.replace(url.toString());
      } catch {
        window.location.reload();
      }
    },
    [remoteVersion]
  );

  // Register Service Worker directly in production and track waiting/installing workers
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (!import.meta.env.PROD) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((r) => void r.unregister());
        })
        .catch(() => {});
      return;
    }

    let isMounted = true;
    let currentReg: ServiceWorkerRegistration | null = null;
    const workerCleanups: Array<() => void> = [];

    const trackInstallingWorker = (worker: ServiceWorker | null) => {
      if (!worker) return;

      const handleStateChange = () => {
        if (!isMounted) return;
        if (worker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            setHasWaitingSW(true);
            setIsDismissed(false);
          } else {
            setOfflineReady(true);
          }
        }
      };

      worker.addEventListener('statechange', handleStateChange);
      workerCleanups.push(() => worker.removeEventListener('statechange', handleStateChange));
    };

    const handleUpdateFound = () => {
      if (!currentReg) return;
      trackInstallingWorker(currentReg.installing);
    };

    const handleControllerChange = () => {
      if (userConfirmedUpdateRef.current) {
        performCleanReload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        if (!isMounted) return;
        currentReg = reg;
        registrationRef.current = reg;

        if (reg.waiting) {
          setHasWaitingSW(true);
        }
        if (reg.installing) {
          trackInstallingWorker(reg.installing);
        }

        reg.addEventListener('updatefound', handleUpdateFound);
      })
      .catch((error) => {
        console.warn('Service worker registration error:', error);
      });

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      if (currentReg) {
        currentReg.removeEventListener('updatefound', handleUpdateFound);
      }
      workerCleanups.forEach((cleanup) => cleanup());
    };
  }, [performCleanReload]);

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current || isUpdating) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    isCheckingRef.current = true;
    let foundUpdate = false;

    try {
      let reg = registrationRef.current;
      if (!reg && 'serviceWorker' in navigator && import.meta.env.PROD) {
        reg = (await navigator.serviceWorker.getRegistration().catch(() => undefined)) || null;
        if (reg) registrationRef.current = reg;
      }

      if (reg) {
        await reg.update().catch(() => {});
        if (reg.waiting) {
          setHasWaitingSW(true);
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
          } else if (data?.version && data.version === currentVersion) {
            setHasRemoteVersionMismatch(false);
            setRemoteVersion(null);
          }
        }
      }
    } catch {
      // Network temporarily unavailable; preserve current state quietly
    } finally {
      isCheckingRef.current = false;
    }

    return foundUpdate;
  }, [currentVersion, isUpdating]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void checkForUpdate();
    }, 1200);

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
      setUpdateError(null);
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

  const applyUpdate = useCallback(async () => {
    if (isUpdating) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setUpdateError('ইন্টারনেট সংযোগ নেই। সংযোগ সচল হলে আবার চেষ্টা করুন।');
      return;
    }

    setUpdateError(null);
    setIsUpdating(true);
    userConfirmedUpdateRef.current = true;

    const recoveryTimer = window.setTimeout(() => {
      if (!reloadingRef.current) {
        userConfirmedUpdateRef.current = false;
        setIsUpdating(false);
        setUpdateError('আপডেট লোড হতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    }, STUCK_RECOVERY_TIMEOUT_MS);

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
        // ignore cache deletion errors
      }
    };

    const waitForWaitingWorker = async (
      reg: ServiceWorkerRegistration,
      timeoutMs: number
    ): Promise<ServiceWorker | null> => {
      if (reg.waiting) return reg.waiting;

      await reg.update().catch(() => {});
      if (reg.waiting) return reg.waiting;

      return new Promise<ServiceWorker | null>((resolve) => {
        let settled = false;
        const finish = (worker: ServiceWorker | null) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(overallTimer);
          window.clearTimeout(updateFoundTimer);
          reg.removeEventListener('updatefound', onUpdateFound);
          resolve(worker);
        };

        const overallTimer = window.setTimeout(() => {
          finish(reg.waiting || null);
        }, timeoutMs);

        // If no installing worker exists yet, don't block the full 15s waiting for updatefound
        const updateFoundTimer = window.setTimeout(() => {
          if (!reg.installing && !reg.waiting) {
            finish(null);
          }
        }, 3000);

        const attachInstalling = (worker: ServiceWorker) => {
          const onStateChange = () => {
            if (worker.state === 'installed') {
              worker.removeEventListener('statechange', onStateChange);
              finish(reg.waiting || worker);
            } else if (worker.state === 'redundant') {
              worker.removeEventListener('statechange', onStateChange);
              finish(reg.waiting || null);
            }
          };
          worker.addEventListener('statechange', onStateChange);
          if (worker.state === 'installed') {
            worker.removeEventListener('statechange', onStateChange);
            finish(reg.waiting || worker);
          }
        };

        const onUpdateFound = () => {
          if (reg.installing) {
            attachInstalling(reg.installing);
          }
        };

        if (reg.installing) {
          attachInstalling(reg.installing);
        } else {
          reg.addEventListener('updatefound', onUpdateFound);
        }
      });
    };

    try {
      let reg = registrationRef.current;
      if (!reg && 'serviceWorker' in navigator && import.meta.env.PROD) {
        reg = (await navigator.serviceWorker.getRegistration().catch(() => undefined)) || null;
        if (reg) registrationRef.current = reg;
      }

      if (reg) {
        const waitingWorker = await waitForWaitingWorker(reg, INSTALL_WAIT_TIMEOUT_MS);

        if (waitingWorker) {
          await new Promise<void>((resolve) => {
            const onControllerChange = () => {
              window.clearTimeout(fallbackTimer);
              resolve();
            };

            const fallbackTimer = window.setTimeout(() => {
              navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
              resolve();
            }, CONTROLLER_CHANGE_TIMEOUT_MS);

            navigator.serviceWorker.addEventListener('controllerchange', onControllerChange, {
              once: true,
            });
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          });

          window.clearTimeout(recoveryTimer);
          performCleanReload();
          return;
        }

        // No waiting SW after check/install attempt (e.g. legacy SW or mismatch without SW diff):
        // Unregister stale SW, purge only static caches, and reload cleanly from network.
        await reg.unregister().catch(() => {});
      }

      await clearStaticCachesOnly();
      window.clearTimeout(recoveryTimer);
      performCleanReload();
    } catch (error) {
      console.warn('PWA update activation fallback:', error);
      await clearStaticCachesOnly();
      window.clearTimeout(recoveryTimer);
      performCleanReload();
    }
  }, [isUpdating, performCleanReload]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const reopenBanner = useCallback(() => {
    setUpdateError(null);
    setIsDismissed(false);
  }, []);

  return {
    updateAvailable: hasWaitingSW || hasRemoteVersionMismatch,
    remoteVersion,
    currentVersion,
    isUpdating,
    updateError,
    isDismissed,
    offlineReady,
    applyUpdate,
    dismissBanner,
    reopenBanner,
    checkForUpdate,
  };
}
