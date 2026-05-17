// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
// @knipignore Exposed through main-process consumers and electron entrypoints.

import { userConfig } from '../../app/user_config.main.ts';
import {
  DEFAULT_TOR_PROXY_URL,
  type NetworkProxyMode,
} from '../types/NetworkProxy.std.ts';

type StoredNetworkProxySettingsType = Readonly<{
  mode: NetworkProxyMode;
  customUrl: string | null;
}>;

const VALID_PROTOCOLS = new Set([
  'http:',
  'https:',
  'socks:',
  'socks4:',
  'socks4a:',
  'socks5:',
  'socks5h:',
]);

export function getSystemProxyUrlFromEnvironment(): string | undefined {
  if (process.env.COCA_USE_TOR === '1' || process.env.COCA_USE_TOR === 'true') {
    return process.env.COCA_TOR_PROXY_URL || DEFAULT_TOR_PROXY_URL;
  }

  return (
    process.env.COCA_PROXY_URL ||
    process.env.SIGNAL_PROXY_URL ||
    process.env.ALL_PROXY ||
    process.env.all_proxy ||
    process.env.SOCKS_PROXY ||
    process.env.socks_proxy ||
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    undefined
  );
}

export function isValidProxyUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return VALID_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function getStoredNetworkProxySettings(): StoredNetworkProxySettingsType {
  const rawMode = userConfig.get('networkProxyMode');
  const rawCustomUrl = userConfig.get('networkProxyUrl');

  const mode: NetworkProxyMode =
    rawMode === 'direct' ||
    rawMode === 'system' ||
    rawMode === 'custom' ||
    rawMode === 'tor'
      ? rawMode
      : 'system';

  return {
    mode,
    customUrl: typeof rawCustomUrl === 'string' ? rawCustomUrl : null,
  };
}

export function getResolvedProxyUrl(): string | undefined {
  const { mode, customUrl } = getStoredNetworkProxySettings();

  if (mode === 'direct') {
    return undefined;
  }

  if (mode === 'tor') {
    return process.env.COCA_TOR_PROXY_URL || DEFAULT_TOR_PROXY_URL;
  }

  if (mode === 'custom') {
    return customUrl || undefined;
  }

  return getSystemProxyUrlFromEnvironment();
}

export function getElectronProxyRules(
  proxyUrl: string | undefined
): string | undefined {
  if (!proxyUrl) {
    return undefined;
  }

  const url = new URL(proxyUrl);

  // Chromium proxy rules support `socks5://`, but not the hostname-preserving
  // `socks5h://` variant used by node proxy agents.
  if (url.protocol === 'socks5h:') {
    return `socks5://${url.host}`;
  }

  return proxyUrl;
}
