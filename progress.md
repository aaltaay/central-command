# AhmiOS Site - Progress & Handoff Document

This document is used to track the progress of `ahmios-site` development so any AI agent can pick up where the previous one left off.

## Current Goal
- **Migrate and re-brand** the dashboard from `central-command` to `ahmios-site` within the Altay Studio ecosystem.
- **Password Protection**: Ensure the entire site requires the password `123456` to access.
- **Live News Feature**: Integrate the Perplexity API into the Express backend to allow the user to fetch live news events, displayed in the frontend dashboard.

## Task Status

### 1. Project Initialization & Renaming
- [x] Rename directory to `ahmios-site`
- [x] Create this `progress.md` handoff file

### 2. Password Protection
- [x] Create a frontend authentication wrapper.
- [x] Hardcode the `123456` password requirement.

### 3. Live News Feature
- [x] Update `server/index.ts` to include a `/api/news/ask` endpoint using `PERPLEXITY_API_KEY` from `.env.secrets` (which is standard in the AhmiOS ecosystem).
- [x] Create a Live News UI component in `src/App.tsx` replacing the static RSS feed.

### 4. Vercel Configuration
- [x] Verified `vercel.json` matches the standard deployment configuration.
- [ ] (Manual Step) User needs to re-link Vercel to this new repository name (`ahmios-site`).

---
**Last Updated**: Migration complete. All core features implemented. Waiting for Vercel relinking.
