# Campus Notifications Microservice

This repository contains a TypeScript Next.js priority inbox for the campus notifications assignment.

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

## App Flow

The app loads notifications from `http://4.224.186.213/evaluation-service/notifications`, sorts them by priority and time, and shows the top entries in a Material UI inbox.

The reusable middleware still lives in [logging_middleware/client.ts](logging_middleware/client.ts) and [logging_middleware/logger.ts](logging_middleware/logger.ts), and it is used to log notification fetch success or failure.

If you want to run the logger from the terminal, use [scripts/log-terminal.mjs](scripts/log-terminal.mjs).