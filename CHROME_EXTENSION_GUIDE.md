# Chrome Extension Development Guide

## Core Concepts

### 1. Manifest.json
The `manifest.json` file is the heart of your extension. It defines:
- Extension metadata (name, version, description)
- Permissions (what APIs your extension can access)
- Background scripts (service workers)
- Content scripts (scripts that run in web pages)
- Popup UI (what shows when clicking the extension icon)
- Options page (settings page)

### 2. Manifest V3 (Current Standard)
- Uses **Service Workers** instead of background pages
- More restrictive permissions model
- Better security and performance
- Required for new extensions

### 3. Key APIs for Focus Extension

#### Blocking Websites
- **`chrome.declarativeNetRequest`** (Recommended)
  - Declarative rules for blocking/allowing sites
  - Works offline, more performant
  - Can block based on URL patterns
  
- **`chrome.webRequest`** (Alternative)
  - Event-based blocking
  - Requires host permissions
  - More flexible but less performant

#### Storage
- **`chrome.storage`** - Local storage for extension data
- **Supabase** - Cloud database for sync across devices

#### Real-time Updates
- **Supabase Realtime** - WebSocket subscriptions
- **Polling** - Periodic checks to Supabase

### 4. Extension Structure

```
focus-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (background logic)
├── popup.html            # UI when clicking extension icon
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── options.html          # Settings page (optional)
├── options.js            # Settings logic
├── content.js            # Content script (if needed)
├── icons/                # Extension icons
└── assets/               # Other assets
```

### 5. Development Workflow

1. **Load Extension**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your extension folder

2. **Debugging**
   - Popup: Right-click extension icon → Inspect popup
   - Background: Go to `chrome://extensions/` → Service Worker link
   - Content scripts: Use DevTools on the page

3. **Testing**
   - Test in Chrome
   - Use `chrome.storage` API for local state
   - Test Supabase integration

### 6. Permissions Needed for Focus

```json
{
  "permissions": [
    "storage",                    // For chrome.storage
    "declarativeNetRequest",      // For blocking sites
    "declarativeNetRequestWithHostAccess"  // If blocking specific hosts
  ],
  "host_permissions": [
    "https://your-supabase-url.com/*"  // For API calls
  ]
}
```

### 7. Blocking Flow

**Option A: DeclarativeNetRequest (Recommended)**
- Define rules in manifest or dynamically
- Rules are evaluated by Chrome
- Can add/remove rules programmatically
- Works offline

**Option B: WebRequest**
- Listen to `onBeforeRequest` events
- Cancel requests programmatically
- Requires host permissions
- Less performant

### 8. Supabase Integration

- Use `fetch()` API for HTTP requests
- Use Supabase Realtime for live updates
- Store user sessions/tokens securely
- Use Row Level Security (RLS) for data protection

## Next Steps

1. Set up project structure
2. Create manifest.json
3. Implement blocking mechanism
4. Build popup UI
5. Integrate Supabase
6. Add QR code generation/scanning flow
7. Test and iterate
