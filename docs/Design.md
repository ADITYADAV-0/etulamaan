# Design.md — Design System

This is the single source of truth for anything a user (or officer) sees. If code and this file disagree, fix one of them deliberately — don't let them silently drift apart.

## 1. Brand palette

Consistent with the SIH pitch deck and all diagrams produced for this project — reuse these tokens, don't invent new hex values per screen.

| Token | Hex | Use |
|---|---|---|
| `color-navy` | `#1F3864` | Primary brand, headers, Applicant-lane accents |
| `color-blue` | `#0070C0` | Primary action color, links, Platform/system accents |
| `color-gold` | `#C69214` | Certification / seal motif, warnings, Admin accents |
| `color-green` | `#1E7A46` | Success, pass states, LMO/GATC accents |
| `color-red` | `#B23A2E` | Fail states, enforcement, destructive actions |
| `color-dark` | `#263238` | Primary text |
| `color-gray` | `#5B6B73` | Secondary text, captions |
| `color-light-bg` | `#F4F7FB` | Section backgrounds, cards |

Dark mode: invert backgrounds, keep brand hues but check contrast (WCAG AA minimum, see §6) rather than reusing light-mode values unchanged.

## 2. Typography

- **Headings:** Times New Roman / a serif, bold — matches the official SIH template and gives the product a "government document of record" feel appropriate to a certification system.
- **Body/UI:** Calibri or a comparable humanist sans (system font stack in production: `-apple-system, "Segoe UI", Roboto, sans-serif`) — optimized for dense forms and tables.
- Scale: 22/18/14/11/9.5pt roughly, don't introduce arbitrary in-between sizes.

## 3. Core UI patterns

- **Status pills**, not free text, for application/certificate state: `Submitted` (gray) → `Scheduled` (blue) → `Inspected` (gold) → `Certified` (green) / `Rejected` (red). Reuse one `<StatusPill>` component everywhere a status appears — the owner dashboard, the LMO task list, and the admin table must render the same state identically.
- **Swimlane / stepper pattern** for anything showing the verification lifecycle (see the working-prototype flowchart) — four lanes: Applicant, Platform, LMO/GATC, Admin, each with its lane color from §1.
- **Certificate card**: QR code prominent top-right, instrument details left, validity dates and a clear Valid/Expired/Revoked badge. This exact layout is what gets scanned and judged in the field — don't redesign it per screen.
- **Inspection checklist (mobile)**: one item per screen or a scrollable checklist with large touch targets (field officers, gloved hands, outdoor light) — high contrast, minimum 44×44pt tap targets.
- **Forms**: inline validation, not a summary error block at the top — this is a compliance form filled out by non-technical users, every error needs to be at the point of the mistake.

## 4. Key screens (build these to match, don't freelance layout)

1. **Owner dashboard** — instrument list, status per instrument, renewal countdown, "Apply for verification" CTA.
2. **Application form** — multi-step: instrument details → documents/photos → fee payment → review & submit.
3. **LMO/GATC task queue** — list of assigned inspections, filterable by due date/jurisdiction, tap to open inspection form.
4. **Inspection form (mobile-first)** — checklist + readings + photo/geo-tag capture + pass/fail decision + offline indicator.
5. **Admin dashboard** — pendency by jurisdiction, SLA compliance, enforcement queue, exportable reports.
6. **Public certificate verification page** — no login, QR-scan destination, shows Valid/Expired/Revoked plus instrument summary only (no owner PII).

## 5. Iconography

Line/solid icon set consistent with the lane icons used in the architecture diagram: user-shield (identity/owner), clipboard-check (inspection), QR/certificate (certification), bell (alerts), server/database (platform), bar-chart (admin/analytics), shield/lock (security). Don't mix icon families within one screen.

## 6. Accessibility

WCAG 2.1 AA minimum: 4.5:1 text contrast, all interactive elements keyboard-reachable, form fields properly labeled (not placeholder-only), alt text on all evidence photos in review views. Multilingual support (Hindi/English + regional) is a stated requirement in `PRD.md` — don't hardcode English strings; route all UI text through the i18n layer from the start, retrofitting is expensive.

## 7. What NOT to do

- Don't introduce a new color outside §1's palette for a "just this once" UI need — add it to the palette deliberately or don't add it.
- Don't build the public verification page to show anything beyond instrument + validity status — it's public and unauthenticated, no owner contact info, no inspection photos.
- Don't make the mobile inspection flow assume a stable connection at any point — every screen needs a visible offline/sync state.
