# Focus Chrome Extension - Clarifying Questions

## Architecture & Flow

1. **QR Code Flow Direction:**
   - Option A: Extension shows QR code → Phone scans → Phone validates with Supabase → Extension checks Supabase → Unblocks
   - Option B: Phone generates QR code → Extension scans → Extension validates → Unblocks
   - Which direction do you prefer?

2. **Phone App:**
   - Do you already have a phone app, or do we need to build one?
   - Should it be iOS, Android, or both?
   - Or can we use a web-based QR scanner on the phone?

3. **Unblock Duration:**
   - How long should the unblock last?
     - One-time session only?
     - Time-limited (e.g., 15 minutes, 1 hour)?
     - Until manually re-blocked?
     - Permanent?

4. **User Authentication:**
   - Do users need accounts?
   - Should it be email/password, OAuth (Google/GitHub), or anonymous?
   - Should settings sync across devices?

5. **Blocking Mechanism:**
   - Should sites be blocked immediately on install, or only after user configures?
   - Can users add/remove sites from blocklist?
   - Should there be different block schedules (e.g., work hours only)?

6. **Design Preferences:**
   - What specific elements from Opal do you want to incorporate?
   - Color scheme preferences (calm = pastels, muted tones)?
   - Should the popup be minimal or feature-rich?

7. **Backend Requirements:**
   - What data needs to be stored in Supabase?
     - User accounts?
     - Blocked sites list?
     - Unblock tokens/sessions?
     - Usage statistics?

## Technical Preferences

8. **Framework:**
   - Vanilla JavaScript, React, or another framework for the popup?
   - Any preference for UI libraries (e.g., Tailwind, Material-UI)?

9. **QR Code Library:**
   - Any preference for QR code generation library?

10. **Initial Setup:**
    - Should there be an onboarding flow?
    - Default blocked sites or empty list?
