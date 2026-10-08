# Embedded RSVP Response Sheet & Streamlined Form

Streamline the RSVP section to collect exactly the three requested fields—Full Name, Attendance Confirmation, and Number of Persons Attending—and embed a real-time response spreadsheet table directly beneath the RSVP form card for instant attendee tracking.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters have been confirmed through user clarification:
> - **Confirmed Placement**: The collected RSVP sheet will be rendered directly below the RSVP form card in the RSVP section.
> - **Confirmed Field Scope**: The form will strictly focus on the three requested fields: **Full Name**, **Attendance Confirmation**, and **Number of Persons Attending**.
> - **Data Persistence**: Submissions will persist directly to Cloud Firestore in real time, with immediate local-state synchronization and optional Google Sheets backup.

---

## 1. Overview & Core Concept

- **What It Does**: Guests fill out a clean, focused 3-field RSVP card (Full Name, Attendance Confirmation, Number of Persons Attending). Immediately upon submission, the live response sheet table rendered below the form updates in real time to display the entry alongside all previous responses.
- **Target Audience / Persona**:
  - **Wedding Guests**: Experience a frictionless, quick RSVP submission process with no unnecessary fields.
  - **Wedding Hosts & Couples**: Have an immediate, transparent "sheet" overview of guest headcounts, attendance status, and attendee names directly on the page.
- **Key Value**: Eliminates submission friction for guests while giving hosts an instant, elegant spreadsheet view without having to open an external app or separate dashboard.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Guest Submission**:
   - Guest arrives at `#rsvp`.
   - Guest enters **Full Name**.
   - Guest clicks **Attendance Confirmation** toggle (*Joyfully Attending* or *Regretfully Decline*).
   - If attending, guest selects the **Number of Persons Attending** (1 to max guests allowed).
   - Guest clicks **Submit RSVP**.
2. **Instant Sheet Synchronization**:
   - The form confirms submission with an elegant confirmation state.
   - The embedded **Live RSVP Sheet** table directly below flashes a subtle highlight on the newly recorded entry.
   - Metric counters (*Total Responses*, *Confirmed Attending*, *Declined*) update instantaneously.

### Visual Identity & Theme
- **Spreadsheet Table Styling**:
  - Follows the wedding theme's botanical palette (`#FCFAF6` background, `#2E2420` headers, subtle warm hairline borders `#E6DCce`).
  - High-density data grid with compact row heights ($40\text{px}$–$44\text{px}$) and subtle row hover highlights.
  - Column alignment: text left-aligned, guest counts right-aligned using `tabular-nums font-mono`.
  - Column headers matching user specification:
    1. **Full Name**
    2. **Attendance Confirmation**
    3. **Number of Persons Attending**
    4. **Date Recorded**
- **Zero-Pill Discipline**:
  - Attendance statuses rendered with crisp typography and subtle status tints (quiet emerald for attending, warm amber for declining) rather than garish capsule badges.
- **Search & Filter Affordance**:
  - Quick search filter to find a specific guest by name.
  - Export to CSV button for hosts to download the sheet anytime.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Streamlined 3-Field Form vs. Multi-Step Form**:
  - *Chosen Approach*: Strictly show the 3 required fields in the RSVP card. Secondary session checkboxes and freeform message notes are removed from the mandatory RSVP flow.
  - *Why*: Reduces cognitive load and form abandonment, exactly matching the user's requirements.
- **Decision 2: Live Embedded Spreadsheet Component**:
  - *Chosen Approach*: Render an interactive, real-time data table directly inside `RsvpSection.tsx` beneath the submission card, backed by Firestore's `onSnapshot` listener and localStorage fallback.
  - *Why*: Gives both immediate visual confirmation and an accessible spreadsheet table right where the guest and host interact.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    RsvpSection Container                     │
├───────────────────────────────┬──────────────────────────────┤
│      RSVP Form Card           │   Live RSVP Sheet Component   │
│  - Full Name                  │  - Summary Metrics Bar       │
│  - Attendance Confirmation    │  - Search / Filter Input     │
│  - Number of Persons          │  - High-Density Data Table   │
│  - Submit Action              │  - CSV Export Affordance     │
└───────────────┬───────────────┴──────────────┬───────────────┘
                │                              ▲
                ▼                              │
┌──────────────────────────────────────────────┴───────────────┐
│               Firebase Firestore (rsvps)                     │
│    Real-time write on submit  ──► Real-time onSnapshot sync  │
└──────────────────────────────────────────────────────────────┘
```

### Data Model & Mapping
```typescript
interface RsvpRecord {
  id: string;
  fullName: string;          // Maps to user's "Full Name"
  attendance: 'attending' | 'declined'; // Maps to "Attendance Confirmation"
  numberOfGuests: number;    // Maps to "Number of Persons Attending"
  timestamp: string;         // ISO date or formatted string
}
```

### Execution Steps
1. **Update `RsvpSection.tsx` Form UI**:
   - Focus the form strictly on:
     - `Full Name` text input.
     - `Attendance Confirmation` dual-state toggle (Joyfully Attending / Regretfully Decline).
     - `Number of Persons Attending` counter/dropdown (active when attending, defaults to 0 or 1).
2. **Implement `RsvpResponsesSheet` Subcomponent**:
   - Build an editorial data grid directly below the form card.
   - Include columns: `Full Name`, `Attendance Confirmation`, `Number of Persons Attending`, and `Recorded Time`.
   - Real-time listener hook to pull submissions from Firestore and local cache.
   - CSV export functionality (`Download Sheet as CSV`).
3. **Verify Build & Style Integrity**:
   - Run linter and compiler to guarantee type safety and responsiveness.
