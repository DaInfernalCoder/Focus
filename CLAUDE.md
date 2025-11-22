# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FocusApp is a website blocking system consisting of a Chrome extension and a Next.js web application. The extension blocks distracting websites, which can be unlocked through a QR code flow managed by the web app.

## Repository Structure

This is an npm workspace monorepo with three main packages:

- `apps/focus-scanner` - Next.js 16 web application (App Router) for QR unlock flow
- `apps/focus-extension` - Chrome extension (Manifest V3) for site blocking
- `packages/shared` - Shared constants used across apps

## Development Commands

### Web App (focus-scanner)
```bash
# Development server (runs on http://localhost:3000)
npm run dev:web

# Production build
npm run build:web

# Lint
cd apps/focus-scanner && npm run lint
```

### Chrome Extension (focus-extension)
```bash
# Build extension
npm run build:extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select apps/focus-extension/
```

## Tech Stack

### focus-scanner (Web App)
- **Framework**: Next.js 16 with App Router and React 19
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Backend**: Supabase (authentication, database)
- **Language**: TypeScript
- **Key Dependencies**:
  - `@supabase/ssr` and `@supabase/supabase-js` for Supabase integration
  - `lucide-react` for icons
  - `class-variance-authority`, `clsx`, `tailwind-merge` for styling utilities

### focus-extension (Chrome Extension)
- **Manifest**: Version 3
- **Language**: Vanilla JavaScript
- **APIs**: chrome.declarativeNetRequest, chrome.storage

## Architecture

### Extension Architecture
The Chrome extension (`focus-extension`) uses:
- **Service Worker** (`background.js`): Manages site blocking rules using Chrome's declarativeNetRequest API
- **Storage**: Uses chrome.storage.local to persist blocked sites list and blocking state
- **Dynamic Rules**: Creates redirect rules that send blocked sites to `blocked.html`
- **Popup**: UI for managing blocked sites configuration

### Web App Architecture
The Next.js app (`focus-scanner`) uses:
- **App Router** with client components (most pages use `'use client'`)
- **Routes**:
  - `/` - Main landing/QR generation page
  - `/unlock` - Token validation and unlock confirmation page
- **Supabase Integration**:
  - Client-side: `lib/supabase/client.ts` using `@supabase/ssr`
  - Server-side: `lib/supabase/server.ts` for server components
  - Table: `unlock_tokens` stores QR unlock tokens with expiry and consumption tracking
- **UI Components**: shadcn/ui components in `components/ui/`

### Unlock Flow
1. Extension generates QR code with unique token
2. User scans QR code → opens web app at `/unlock?token=xxx`
3. Web app validates token against Supabase `unlock_tokens` table
4. Checks: token exists, not consumed, not expired
5. Marks token as consumed in database
6. Extension polls/checks for unlock status

### Shared Constants
Constants in `packages/shared/constants.js`:
- `QR_EXPIRY_MINUTES`: QR code expiry time (5 minutes)
- `POLL_INTERVAL_MS`: Polling interval for status checks (2000ms)
- `TABLE_NAME`: Supabase table name ('unlock_tokens')

## Environment Variables

Required in `.env.local` (root level):
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000
```

## Cursor Rules

When implementing any technology (especially Supabase and shadcn), always query the context7 MCP tool to ensure implementation matches current documentation rather than relying solely on training data.

## Path Aliases

The web app uses TypeScript path aliases:
- `@/*` maps to the root of `apps/focus-scanner/`
- Example: `@/lib/supabase/client` → `apps/focus-scanner/lib/supabase/client.ts`

## Key Files

- [apps/focus-extension/background.js](apps/focus-extension/background.js) - Extension service worker with blocking logic
- [apps/focus-extension/manifest.json](apps/focus-extension/manifest.json) - Extension configuration
- [apps/focus-scanner/app/unlock/page.tsx](apps/focus-scanner/app/unlock/page.tsx) - QR unlock validation page
- [apps/focus-scanner/lib/supabase/client.ts](apps/focus-scanner/lib/supabase/client.ts) - Supabase client initialization
- [packages/shared/constants.js](packages/shared/constants.js) - Shared constants
