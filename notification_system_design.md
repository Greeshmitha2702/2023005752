# Notification System Design — Stage 1

Overview
--------

This document covers Stage 1: notification priority logic (no UI). The goal is to fetch notifications from the API and return the Top N important unread notifications based on type importance and recency.

Priority rules
--------------

- Type weights: Placement = 3, Result = 2, Event = 1
- Newer timestamps are preferred
- Combined score = TypeWeight * 1e12 + timestampMillis (so type dominates, then recency)

Algorithms
----------

Two implementations are provided in `notification_app_fe/src/utils/priorityLogic.ts`:

1. getTopNotificationsSorted(items, n)
   - Simple approach: compute score for each item, sort descending, take top-n
   - Time: O(n log n)
   - Memory: O(n)

2. getTopNotificationsStream(items, n)
   - Streaming/top-n approach using min-heap (size k=n)
   - Time: O(n log k)
   - Memory: O(k)

When to use each
----------------

- For small-to-moderate lists (thousands): `getTopNotificationsSorted` is simplest and fast.
- For very large streams (millions) or when maintaining a rolling top-N in constant memory, use `getTopNotificationsStream`.

Complexity and scalability
--------------------------

- Sorting: O(n log n). For n=100k this is feasible in many environments but costs memory.
- Streaming (heap): O(n log k) with O(k) memory. For top-10 on large streams this is ideal.

Files added
-----------

- `notification_app_fe/src/utils/priorityLogic.ts` — TypeScript implementation (exports `getTopNotificationsSorted`, `getTopNotificationsStream`, and default `getTopNotifications`).
- `notification_app_fe/src/utils/priorityLogic.js` — JavaScript companion for demo runs.
- `notification_app_fe/run_stage1_demo.mjs` — demo runner showing API sample and processed outputs.
- `notification_app_fe/sample_notifications.json` — sample API response used by the demo.

Sample run
----------

From the repository root run:

```bash
node notification_app_fe/run_stage1_demo.mjs
```

Expected output (sample):

```
API Response (sample):
[ ... sample JSON ... ]

Top 3 (sorted approach):
[ ... top 3 items ... ]

Top 3 (stream approach):
[ ... top 3 items ... ]
```

Notes about logging
-------------------

Stage 1 does not include UI; logging middleware is integrated in Stage 2. Calls and page events should use the provided `logging_middleware` helpers (e.g. `Log('frontend','info','api','Fetching notifications')`) when Stage 2 is implemented.

Screenshots
-----------

Include the terminal output from running the demo above. (I added `run_stage1_demo.mjs` to produce the sample response and processed output.)

Next steps (Stage 2)
--------------------

- Scaffold `notification_app_fe` frontend with React + TypeScript + Material UI
- Implement API integration (`notification_app_fe/src/api/notificationApi.ts`) using `logging_middleware`
- Build pages: `AllNotifications` and `PriorityNotifications`
- Integrate priority logic and add filters/pagination
- Add logs on API start/success/failure and on page load and filter changes
# Notification System Design

## Frontend

- Next.js app in `app/`
- Reusable logging package in `logging_middleware/`
- Material UI for components and vanilla CSS for global styling

## Logging Middleware

- Reusable API helper exposed as `Log(stack, level, packageName, message)`
- Supports registration, authentication, and protected log submission
- Uses the test server at `http://4.224.186.213/evaluation-service`
- Accepts the required lowercase stacks, levels, and package names from the instructions

## Required Repository Structure

- `logging_middleware/`
- `notification_system_design.md`
- `notification_app_be/`
- `notification_app_fe/`
- `.gitignore`