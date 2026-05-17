// Copyright 2023 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

async function loadPlugin<T>(
  loader: () => Promise<T>,
  pick: (mod: T) => unknown,
): Promise<unknown | null> {
  try {
    return pick(await loader());
  } catch {
    return null;
  }
}

const dynamicImport = (specifier: string): Promise<unknown> =>
  Function('s', 'return import(s)')(specifier) as Promise<unknown>;

const react: any = await loadPlugin(
  () => dynamicImport('@vitejs/plugin-react'),
  (mod) => (mod as any).default,
);
const visualizer: any = await loadPlugin(
  () => dynamicImport('rollup-plugin-visualizer'),
  (mod) => (mod as any).visualizer,
);

// https://vitejs.dev/config/
export default {
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  worker: {
    format: 'es',
  },
  plugins: [react && react(), visualizer && visualizer()].filter(Boolean),
  server: {
    proxy: {
      '/api/socket': {
        secure: true,
        target: 'wss://create.staging.signal.art',
        changeOrigin: true,
        headers: {
          origin: 'https://create.staging.signal.art',
        },
      },
      '/api': {
        secure: true,
        target: 'https://create.staging.signal.art',
        changeOrigin: true,
      },
    },
  },
};
