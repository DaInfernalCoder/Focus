# Chrome Extension Development Guide

## Overview
Chrome extensions are built with web technologies (HTML, CSS, JavaScript) but have special APIs and architecture.

## Key Concepts

### 1. Manifest V3 (Current Standard)
- Uses **Service Workers** instead of background pages
- More secure, better performance
- Required for new extensions

### 2. Extension Architecture

```
Extension Structure:
├── manifest.json          # Configuration file
├── popup.html             # UI when clicking extension icon
├── popup.js               # Logic for popup
├── background.js          # Service worker (runs in background)
├── content.js             # Scripts injected into web pages
├── options.html           # Settings page
└── assets/                # Icons, images, etc.
```

### 3. Important APIs for Focus Extension

#### webRequest API
- **Purpose**: Intercept and block network requests
- **Permission**: `webRequest`, `webRequestBlocking`
- **Usage**: Block specific domains/URLs

```javascript
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Check if URL should be blocked
    if (shouldBlock(details.url)) {
      return {cancel: true}; // Block the request
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);
```

#### Storage API
- **chrome.storage.local**: Store data locally
- **chrome.storage.sync**: Sync across devices (limited to 100KB)
- **For Supabase**: Use Supabase client for cloud storage

#### Tabs API
- Manage browser tabs
- Get current tab info
- Update tab URLs

### 4. Extension Lifecycle

1. **Install**: Extension installed, background script starts
2. **Runtime**: Service worker can be dormant, wakes on events
3. **Popup**: Opens when user clicks icon (temporary, closes when loses focus)
4. **Content Scripts**: Injected into web pages, isolated from page JS

### 5. Communication Patterns

#### Popup ↔ Background
```javascript
// Popup sends message
chrome.runtime.sendMessage({action: "blockSite", url: "..."});

// Background receives
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle message
});
```

#### Background ↔ Content Script
```javascript
// Background to content
chrome.tabs.sendMessage(tabId, {action: "showBlocked"});

// Content to background
chrome.runtime.sendMessage({action: "pageLoaded"});
```

### 6. Permissions Model

Declare permissions in `manifest.json`:
- `webRequest`: Block requests
- `storage`: Save data
- `tabs`: Access tab info
- `activeTab`: Access current tab
- `host_permissions`: Access specific sites

### 7. Security Considerations

- **Content Security Policy (CSP)**: Restricts inline scripts
- **Isolated Worlds**: Content scripts can't access page JS variables
- **CORS**: Extension can bypass CORS for its own requests
- **Service Worker**: No persistent state, use storage APIs

### 8. Development Workflow

1. **Load Extension**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select extension folder

2. **Debugging**:
   - **Popup**: Right-click icon → "Inspect popup"
   - **Background**: Go to `chrome://extensions/` → "Service worker" link
   - **Content Scripts**: Use DevTools on the page

3. **Reloading**:
   - After code changes, click reload icon in `chrome://extensions/`
   - Service worker restarts automatically

### 9. Publishing

- Create account at Chrome Web Store Developer Dashboard
- Package extension (zip file)
- Submit for review
- Pay one-time $5 fee

## For Focus Extension Specifically

### Blocking Flow
1. User installs extension
2. Extension registers `webRequest` listener
3. On navigation, check if domain is blocked
4. If blocked, cancel request and show popup/overlay
5. User can generate QR code to unblock
6. Phone validates via Supabase
7. Extension polls Supabase for unblock token
8. Temporarily allow site access

### Data Flow
```
Extension (Chrome) ←→ Supabase ←→ Phone App
     ↓
  Local Storage (blocked sites, settings)
```

### Key Challenges
1. **Service Worker Lifecycle**: Can be dormant, need to persist state
2. **Request Blocking**: Must be fast, can't be async easily
3. **QR Code Sync**: Need polling or WebSocket for real-time updates
4. **User Experience**: Smooth blocking without jarring redirects
