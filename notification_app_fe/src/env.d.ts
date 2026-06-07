/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_SERVER_URL?: string;
  readonly VITE_TEST_ACCESS_TOKEN?: string;
  readonly VITE_TEST_CLIENT_ID?: string;
  readonly VITE_TEST_CLIENT_SECRET?: string;
  readonly VITE_TEST_EMAIL?: string;
  readonly VITE_TEST_NAME?: string;
  readonly VITE_TEST_ROLL_NO?: string;
  readonly VITE_TEST_ACCESS_CODE?: string;
  // add other VITE_ env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
