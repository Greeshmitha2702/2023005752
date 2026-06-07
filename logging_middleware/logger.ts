import { Log as logRequest } from './client';
import type { LogLevel, LogPackage, LogStack, LoggingOptions } from './types';

export default async function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string,
  overrides: LoggingOptions = {}
) {
  return logRequest(stack, level, packageName, message, overrides);
}

export { logRequest as Log };