# Focus Extension - Architecture Questions

Before building, I need to clarify the following:

## 1. Unblocking Flow
**How does the QR code unblocking work?**
- Does the phone app generate a QR code that the extension scans?
- Or does the extension generate a QR code that the phone scans?
- What happens after scanning? Does it:
  - Temporarily unblock for X minutes?
  - Permanently unblock until manually blocked again?
  - Require approval/confirmation on phone?

## 2. Phone App
**Do you want me to build:**
- Just the Chrome extension (QR code displayed in extension)?
- Both extension + a simple web app for phone?
- Or will you build the phone app separately?

## 3. User Authentication
**How do users authenticate?**
- Email/password via Supabase Auth?
- Anonymous users?
- Google OAuth?
- No auth (local only)?

## 4. Blocking Mechanism
**How should blocking work?**
- Block entire domains (e.g., facebook.com blocks all subdomains)?
- Block specific URLs?
- Time-based blocking (e.g., block during work hours)?
- Can users manually unblock temporarily?

## 5. Supabase Schema
**What data do we need to store?**
- User profiles?
- Blocked websites list?
- Unblocking sessions/tokens?
- Usage history/analytics?

## 6. QR Code Content
**What should the QR code contain?**
- A unique session token?
- User ID + timestamp?
- Encrypted unblock request?

## 7. Design Preferences
**Based on Opal's design:**
- Minimal, clean interface?
- Soft colors (blues, grays)?
- Smooth animations?
- Focus on clarity over features?

## 8. Initial Features
**MVP should include:**
- [ ] Add/remove blocked sites
- [ ] Generate QR code for unblocking
- [ ] Scan QR code (or phone app handles this?)
- [ ] Temporary unblocking
- [ ] Blocking status indicator

Please answer these questions so I can build exactly what you need!
