# Focus Extension - Recommended Project Structure

## Proposed Architecture

```
focus-extension/
├── manifest.json                 # Extension configuration
├── popup/
│   ├── popup.html               # Main UI (calm, minimal design)
│   ├── popup.js                 # Popup logic
│   ├── popup.css                # Styling (calm colors, smooth animations)
│   └── components/              # React components (if using React)
│       ├── BlockedSiteList.js
│       ├── QRCodeGenerator.js
│       └── UnblockStatus.js
├── background/
│   └── service-worker.js        # Handles blocking logic
├── content/
│   └── blocked-overlay.js       # Shows when site is blocked
├── options/
│   ├── options.html             # Settings page
│   ├── options.js
│   └── options.css
├── lib/
│   ├── supabase.js              # Supabase client setup
│   ├── qrcode.js                # QR code generation
│   └── storage.js               # Local storage helpers
├── assets/
│   ├── icons/                   # Extension icons (16, 48, 128px)
│   └── images/
└── utils/
    ├── blocklist.js             # Blocklist management
    └── auth.js                  # Authentication helpers
```

## Recommended Tech Stack

### Frontend (Extension)
- **Framework**: React (for better UI management) OR Vanilla JS (simpler, smaller)
- **Styling**: Tailwind CSS (for calm, modern design) OR CSS Modules
- **QR Code**: `qrcode` npm package
- **State Management**: React Context OR simple state management

### Backend (Supabase)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (email/password or OAuth)
- **Real-time**: Supabase Realtime (for instant unblock updates)
- **Storage**: Supabase Storage (if needed for user data)

### Phone App (Future)
- **Option 1**: React Native (iOS + Android)
- **Option 2**: Progressive Web App (PWA) - simpler, no app store
- **Option 3**: Native apps (Swift/Kotlin)

## Data Schema (Supabase)

### Tables

```sql
-- Users (handled by Supabase Auth)
-- Additional user metadata
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  created_at TIMESTAMP,
  settings JSONB
)

-- Blocked sites per user
blocked_sites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  domain TEXT,
  created_at TIMESTAMP,
  is_active BOOLEAN
)

-- Unblock sessions/tokens
unblock_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  domain TEXT,
  token TEXT UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  used_at TIMESTAMP
)
```

## Recommended Flow

1. **User Setup**:
   - Install extension
   - Sign up/login via Supabase Auth
   - Add sites to blocklist (or use defaults)

2. **Blocking**:
   - Extension intercepts navigation
   - Checks if domain is in blocklist
   - If blocked, cancels request
   - Shows calm overlay with QR code option

3. **Unblocking**:
   - User clicks "Unblock" in extension popup
   - Extension generates QR code with unique token
   - Extension creates unblock session in Supabase
   - Phone app scans QR code
   - Phone app validates and confirms via Supabase
   - Extension polls Supabase for confirmation
   - Site is temporarily unblocked

4. **Re-blocking**:
   - After time limit or manual action
   - Site is blocked again

## Design Inspiration (Opal-like)

- **Colors**: Soft pastels, muted tones (lavender, sage green, soft blue)
- **Typography**: Clean, readable sans-serif
- **Animations**: Smooth, gentle transitions
- **Layout**: Minimal, lots of white space
- **Icons**: Simple, line-style icons
- **Feedback**: Gentle notifications, not jarring alerts
