import fs from 'fs';
import path from 'path';
import axios from 'axios';

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, '.env.local');

function loadEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

async function main() {
  const env = loadEnvFile(envPath);
  const baseUrl = env.NEXT_PUBLIC_TEST_SERVER_URL || 'http://4.224.186.213';
  const clientID = env.NEXT_PUBLIC_TEST_CLIENT_ID;
  const clientSecret = env.NEXT_PUBLIC_TEST_CLIENT_SECRET;
  const email = env.NEXT_PUBLIC_TEST_EMAIL;
  const name = env.NEXT_PUBLIC_TEST_NAME;
  const rollNo = env.NEXT_PUBLIC_TEST_ROLL_NO;
  const accessCode = env.NEXT_PUBLIC_TEST_ACCESS_CODE;

  if (!clientID || !clientSecret || !email || !name || !rollNo || !accessCode) {
    throw new Error('Missing registration values in .env.local');
  }

  const authResponse = await axios.post(
    `${baseUrl}/evaluation-service/auth`,
    {
      email,
      name,
      rollNo,
      accessCode,
      clientID,
      clientSecret
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const accessToken = authResponse.data?.access_token;

  if (!accessToken) {
    throw new Error('Auth response did not include access_token');
  }

  const response = await axios.post(
    `${baseUrl}/evaluation-service/logs`,
    {
      stack: 'frontend',
      level: 'info',
      package: 'component',
      message: 'Terminal log test from scripts/log-terminal.mjs'
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('logID:', response.data.logID || 'N/A');
  console.log('message:', response.data.message || 'N/A');
}

main().catch((error) => {
  console.error('Failed to create log.');
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status || 'unknown');
    console.error('Response:', error.response?.data || error.message);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
});