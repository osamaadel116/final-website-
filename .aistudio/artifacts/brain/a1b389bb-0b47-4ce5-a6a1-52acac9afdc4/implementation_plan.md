# Host-Only Private RSVP Responses Sheet

Privatize the embedded RSVP response sheet (`div#rsvp-sheet`) so that end-user guests cannot see attendee data or submission numbers, rendering the sheet strictly when signed in with your host Google account.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed through user clarification:
> - **End-User Visibility**: Regular guests will see **nothing** below the RSVP form card (`div#rsvp-sheet` is completely hidden and unrendered).
> - **Host Unlock Mechanism**: The sheet automatically reveals itself as soon as you sign in with your Google account (`osos11886@gmail.com` or authorized host).
> - **Zero-Trace Security**: Unauthenticated guests cannot view, scroll to, or access the guest list table or response counters.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Regular visitors and wedding guests only see the RSVP submission card (to submit their name, attendance, and party count).
  - The live response table, aggregate statistics, search filter, and CSV export are conditionally rendered: they appear only when the host is authenticated with Google.
  - When the host is signed in, a discreet *"Private Host Ledger"* indicator appears above the table, providing direct access to the live responses and sync actions.
- **Target Audience / Persona**:
  - **Wedding Guests**: Experience a clean, private invitation without seeing other people's names or headcount data.
  - **Host / Couple**: Retains full live visibility of all RSVPs and sync tools directly on the page whenever signed into their Google account.
- **Key Value**: Guarantees guest privacy while keeping full real-time spreadsheet tracking accessible to the host.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Regular Guest Flow**:
   - Guest visits `#rsvp`.
   - Guest sees only the header and the clean 3-field RSVP submission form.
   - Beneath the form, the page proceeds directly to the next wedding section (e.g., Dress Code / Schedule / Wishes).
   - Upon submitting an RSVP, the guest sees their personal confirmation card and no other guest entries.
2. **Host / Admin Flow**:
   - Host signs in via the Google account button or Google Sheets Manager.
   - The app verifies host authentication (`currentUser` with `osos11886@gmail.com` or host status).
   - The private RSVP response sheet reveals itself beneath the RSVP card with a clean *"Host-Only Private View"* indicator and all tools (search, CSV export, Google Sheets sync, real-time counters).

### Visual Identity & Theme
- **For Guests**: Zero layout gaps, ghost containers, or awkward whitespace where the sheet used to be.
- **For Host**:
  - A subtle privacy badge: `<ShieldCheck /> Private Host View — Only visible to osos11886@gmail.com`.
  - All existing features preserved (real-time Firestore updates, CSV export, Google Sheets sync).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Complete Removal from Public DOM vs. Blurred Placeholder**:
  - *Chosen Approach*: Completely omit the sheet container from rendering for unauthenticated users (`if (!isHost) return null`).
  - *Why*: Prevents DOM inspection by tech-savvy guests from revealing attendee names.
- **Decision 2: Automated Unlock on Google Sign-In**:
  - *Chosen Approach*: Leverage the existing Firebase / Google OAuth session (`currentUser?.email === 'osos11886@gmail.com'`).
  - *Why*: Seamless experience for the host with zero extra passwords to remember.

---

## 4. Technical Architecture & Data Strategy

### Architecture Diagram

```
                 Visitor Arrives at #rsvp
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      [Regular Guest]             [Host User]
   (Unauthenticated)        (Signed In via Google)
               │                         │
               ▼                         ▼
   Renders RSVP Form Only       Renders RSVP Form
   Sheet Container = null       + Private RSVP Responses Sheet
                                + Real-Time Sync & CSV Export
```

### Execution Steps
1. **Update `RsvpSection.tsx`**:
   - Integrate `initAuth` / `getCurrentUser` listener from `../services/googleAuth`.
   - Check if the user is authenticated as the host (`currentUser?.email === 'osos11886@gmail.com'` or any authenticated host Google user).
   - Conditionally render `<div id="rsvp-sheet">` strictly when `isHostAuthenticated === true`.
   - Update submission thank-you card to remove any `#rsvp-sheet` link for regular guests.
2. **Add Host Privacy Indicator**:
   - Display a clean, elegant host banner on top of the sheet when unlocked.
3. **Verify Build & Security**:
   - Run `lint_applet` and `compile_applet` to confirm seamless compilation.
