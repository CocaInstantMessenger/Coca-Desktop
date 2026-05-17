// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

export const DEFAULT_TOR_PROXY_URL = 'socks5h://127.0.0.1:9050';

export const NETWORK_PROXY_MODES = [
  'direct',
  'system',
  'custom',
  'tor',
] as const;

export type NetworkProxyMode = (typeof NETWORK_PROXY_MODES)[number];
