import axios from 'axios';
import type {
  AuthPayload,
  AuthResponse,
  LogLevel,
  LogPackage,
  LogRequest,
  LogResponse,
  LogStack,
  LoggingConfig,
  LoggingOptions,
  RegisterResponse,
  RegistrationPayload
} from './types';

const DEFAULT_BASE_URL = 'http://4.224.186.213';
const tokenCache = new Map<string, string>();

export function getLoggingConfig(overrides: LoggingOptions = {}): LoggingConfig {
  return {
    baseUrl: overrides.baseUrl || process.env.NEXT_PUBLIC_TEST_SERVER_URL || DEFAULT_BASE_URL,
    email: overrides.email || process.env.NEXT_PUBLIC_TEST_EMAIL || '',
    name: overrides.name || process.env.NEXT_PUBLIC_TEST_NAME || '',
    mobileNo: overrides.mobileNo || process.env.NEXT_PUBLIC_TEST_MOBILE_NO || '',
    githubUsername: overrides.githubUsername || process.env.NEXT_PUBLIC_TEST_GITHUB_USERNAME || '',
    rollNo: overrides.rollNo || process.env.NEXT_PUBLIC_TEST_ROLL_NO || '',
    accessCode: overrides.accessCode || process.env.NEXT_PUBLIC_TEST_ACCESS_CODE || '',
    clientID: overrides.clientID || process.env.NEXT_PUBLIC_TEST_CLIENT_ID || '',
    clientSecret: overrides.clientSecret || process.env.NEXT_PUBLIC_TEST_CLIENT_SECRET || '',
    accessToken: overrides.accessToken || process.env.NEXT_PUBLIC_TEST_ACCESS_TOKEN || ''
  };
}

function getCacheKey(config: LoggingConfig): string {
  return [config.baseUrl, config.email, config.rollNo, config.clientID, config.accessToken].join('|');
}

function normalizeLevel(level: string): LogLevel {
  const allowedLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

  if (!allowedLevels.includes(level as LogLevel)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return level as LogLevel;
}

function normalizeStack(stack: string): LogStack {
  const allowedStacks: LogStack[] = ['frontend', 'backend'];

  if (!allowedStacks.includes(stack as LogStack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }

  return stack as LogStack;
}

function normalizePackageName(stack: LogStack, packageName: string): LogPackage {
  const backendPackages: LogPackage[] = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service', 'middleware', 'utils', 'auth', 'config'];
  const frontendPackages: LogPackage[] = ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'];

  if (stack === 'backend' && !backendPackages.includes(packageName as LogPackage)) {
    throw new Error(`Invalid backend package: ${packageName}`);
  }

  if (stack === 'frontend' && !frontendPackages.includes(packageName as LogPackage)) {
    throw new Error(`Invalid frontend package: ${packageName}`);
  }

  return packageName as LogPackage;
}

function extractResponseMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string') {
    return data || fallback;
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    return typeof message === 'string' ? message : fallback;
  }

  return fallback;
}

function hasCredentialSet(
  config: LoggingConfig
): config is Required<Pick<LoggingConfig, 'email' | 'name' | 'rollNo' | 'accessCode' | 'clientID' | 'clientSecret'>> & LoggingConfig {
  return Boolean(config.email && config.name && config.rollNo && config.accessCode && config.clientID && config.clientSecret);
}

async function authenticate(config: LoggingConfig): Promise<string> {
  if (config.accessToken) {
    return config.accessToken;
  }

  const cacheKey = getCacheKey(config);
  const cachedToken = tokenCache.get(cacheKey);

  if (cachedToken) {
    return cachedToken;
  }

  if (!hasCredentialSet(config)) {
    throw new Error('Missing logging credentials. Register first and pass the received clientID and clientSecret.');
  }

  try {
    const response = await axios.post<AuthResponse>(
      `${config.baseUrl}/evaluation-service/auth`,
      {
        email: config.email,
        name: config.name,
        rollNo: config.rollNo,
        accessCode: config.accessCode,
        clientID: config.clientID,
        clientSecret: config.clientSecret
      } satisfies AuthPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.access_token) {
      throw new Error('Authentication response did not include access_token.');
    }

    tokenCache.set(cacheKey, response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = extractResponseMessage(error.response?.data, `status ${error.response?.status || 'unknown'}`);
      throw new Error(`Authentication failed: ${message}`);
    }

    throw error;
  }
}

async function submitLog(config: LoggingConfig, request: LogRequest): Promise<LogResponse> {
  const token = await authenticate(config);

  try {
    const response = await axios.post<LogResponse>(
      `${config.baseUrl}/evaluation-service/logs`,
      {
        stack: request.stack,
        level: request.level,
        package: request.packageName,
        message: request.message
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = extractResponseMessage(error.response?.data, `status ${error.response?.status || 'unknown'}`);
      throw new Error(`Log API request failed: ${message}`);
    }

    throw error;
  }
}

async function registerWithTestServer(payload: RegistrationPayload, baseUrl: string): Promise<RegisterResponse> {
  try {
    const response = await axios.post<RegisterResponse>(`${baseUrl}/evaluation-service/register`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = extractResponseMessage(error.response?.data, `status ${error.response?.status || 'unknown'}`);
      throw new Error(`Registration failed: ${message}`);
    }

    throw error;
  }
}

export function createLoggingClient(overrides: LoggingOptions = {}) {
  const config = getLoggingConfig(overrides);

  return {
    config,
    register(payload: RegistrationPayload) {
      return registerWithTestServer(payload, config.baseUrl);
    },
    authenticate() {
      return authenticate(config);
    },
    log(request: LogRequest) {
      const normalizedStack = normalizeStack(request.stack);
      const normalizedLevel = normalizeLevel(request.level);
      const normalizedPackage = normalizePackageName(normalizedStack, request.packageName);

      return submitLog(config, {
        ...request,
        stack: normalizedStack,
        level: normalizedLevel,
        packageName: normalizedPackage
      });
    }
  };
}

export async function registerForTest(payload: RegistrationPayload, overrides: LoggingOptions = {}) {
  return createLoggingClient(overrides).register(payload);
}

export async function authenticateForTest(overrides: LoggingOptions = {}) {
  return createLoggingClient(overrides).authenticate();
}

export async function Log(stack: LogStack, level: LogLevel, packageName: LogPackage, message: string, overrides: LoggingOptions = {}) {
  return createLoggingClient(overrides).log({ stack, level, packageName, message });
}

export type {
  AuthPayload,
  AuthResponse,
  LogLevel,
  LogPackage,
  LogRequest,
  LogResponse,
  LogStack,
  LoggingConfig,
  LoggingOptions,
  RegisterResponse,
  RegistrationPayload
} from './types';
