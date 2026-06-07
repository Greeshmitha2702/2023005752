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