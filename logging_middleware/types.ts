export type LogStack = 'frontend' | 'backend';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';

export type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service' | 'middleware' | 'utils' | 'auth' | 'config';

export type LogPackage = FrontendPackage | BackendPackage;

export interface RegistrationPayload {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
}

export interface AuthPayload {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface LoggingConfig {
  baseUrl: string;
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
  accessToken: string;
}

export interface LoggingOptions {
  baseUrl?: string;
  email?: string;
  name?: string;
  mobileNo?: string;
  githubUsername?: string;
  rollNo?: string;
  accessCode?: string;
  clientID?: string;
  clientSecret?: string;
  accessToken?: string;
}

export interface LogRequest {
  stack: LogStack;
  level: LogLevel;
  packageName: LogPackage;
  message: string;
}

export interface RegisterResponse {
  email?: string;
  name?: string;
  rollNo?: string;
  accessCode?: string;
  clientID?: string;
  clientSecret?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  token_type?: string;
  access_token?: string;
  expires_in?: number;
  [key: string]: unknown;
}

export interface LogResponse {
  logID?: string;
  message?: string;
  [key: string]: unknown;
}