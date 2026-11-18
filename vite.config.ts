import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function versionManifestPlugin(buildVersion: string): Plugin {
  const payload = JSON.stringify(
    {
      version: buildVersion,
      builtAt: new Date().toISOString(),
    },
    null,
    2
  );

  return {
    name: 'version-manifest-plugin',
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.end(payload);
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: payload,
      });
    },
  };
}

export default defineConfig(() => {
  const buildVersion =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    `${Date.now()}`;

  return {
    define: {
      __APP_VERSION__: JSON.stringify(buildVersion),
    },
    plugins: [
      react(),
      tailwindcss(),
      versionManifestPlugin(buildVersion),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        manifest: {
          id: '/',
          name: 'Education Care Coaching Center',
          short_name: 'Education Care Coaching Center',
          description:
            'Education Care Coaching Center - Digital Coaching & Academic Management System.',
          theme_color: '#064E3B',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'any',
          prefer_related_applications: false,
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
          globIgnores: ['**/version.json', '**/pwa-*.png'],
          navigateFallback: undefined,
          runtimeCaching: [
            // Always try network first for HTML navigation so reloads/updates never get stuck on stale HTML
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-navigation-cache',
                networkTimeoutSeconds: 3,
                cacheableResponse: {
                  statuses: [0, 200],
                },
                matchOptions: {
                  ignoreSearch: true,
                },
              },
            },
            // Never cache build version probe
            {
              urlPattern: /\/version\.json(\?.*)?$/i,
              handler: 'NetworkOnly',
            },
            // Never intercept or cache Firestore / Firebase Auth traffic so live DB data stays untouched
            {
              urlPattern: /^https:\/\/(firestore|firebase.*|identitytoolkit|securetoken)\.googleapis\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.maateen\.me\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'bangla-webfont-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'vendor-firebase';
              if (
                id.includes('jspdf') ||
                id.includes('html-to-image') ||
                id.includes('html2canvas')
              ) {
                return 'vendor-pdf';
              }
              if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
              if (id.includes('lucide-react') || id.includes('motion') || id.includes('jszip')) {
                return 'vendor-ui';
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
