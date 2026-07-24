import { handleMockApi } from './mockApi';

/** True when building/serving the GitHub Pages static demo (no Express backend). */
export const isStaticDemo =
  import.meta.env.VITE_STATIC_DEMO === 'true' ||
  import.meta.env.MODE === 'pages';

/**
 * Intercept browser fetch for /api/* when running the static Pages build.
 * Local `npm run dev` still uses the real Express + SQLite server.
 */
export function installStaticDemoFetch() {
  if (!isStaticDemo) return;
  if (typeof window === 'undefined') return;
  if ((window as any).__seedcoopStaticDemoInstalled) return;
  (window as any).__seedcoopStaticDemoInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    // Match absolute, relative, and base-prefixed API paths
    const isApi =
      url.includes('/api/') ||
      url.startsWith('/api') ||
      url.startsWith('api/');

    if (isApi) {
      return handleMockApi(input, init);
    }
    return originalFetch(input, init);
  };

  console.info(
    '%cSeedCoop%c static demo mode — API is in-browser (localStorage). Demo password: demo123',
    'font-weight:bold;color:#14532d',
    'color:inherit'
  );
}
