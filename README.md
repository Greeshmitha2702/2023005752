# Campus Hiring Evaluation Frontend

This repository contains a minimal TypeScript Next.js frontend with a reusable logging client that posts to the test server.

## Setup

1. Run `npm install`.
2. Create a local `.env.local` file with the values you received during registration:
   - `NEXT_PUBLIC_TEST_SERVER_URL`
   - `NEXT_PUBLIC_TEST_EMAIL`
   - `NEXT_PUBLIC_TEST_NAME`
   - `NEXT_PUBLIC_TEST_MOBILE_NO`
   - `NEXT_PUBLIC_TEST_GITHUB_USERNAME`
   - `NEXT_PUBLIC_TEST_ROLL_NO`
   - `NEXT_PUBLIC_TEST_ACCESS_CODE`
   - `NEXT_PUBLIC_TEST_CLIENT_ID`
   - `NEXT_PUBLIC_TEST_CLIENT_SECRET`
3. Start the app with `npm run dev`.

## Logging Client

The reusable client lives in [logging_middleware/client.ts](logging_middleware/client.ts) and exposes `registerForTest`, `authenticateForTest`, and `Log(stack, level, packageName, message)`.

If you want the direct axios-style API from your snippet, use [logging_middleware/logger.ts](logging_middleware/logger.ts), which exports a default `Log` function.

It can register your test account, authenticate with the returned client credentials, and then send the protected log payload. If you already have a bearer token, set `NEXT_PUBLIC_TEST_ACCESS_TOKEN` in `.env.local` and the helper will use it directly.