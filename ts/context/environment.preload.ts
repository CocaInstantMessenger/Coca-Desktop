// Copyright 2023 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { config } from './config.preload.ts';
import {
  Environment,
  getEnvironment,
  parseEnvironment,
  setEnvironment,
} from '../environment.std.ts';

if (
  process.env.NODE_ENV !== 'test' &&
  getEnvironment() !== Environment.Test
) {
  setEnvironment(
    parseEnvironment(config.environment),
    config.isMockTestEnvironment
  );
}

const environment = getEnvironment();

export { environment };
