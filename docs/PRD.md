# PRD — eTulamaan

Unified Online Verification & Digital Certification Platform for Weighing & Measuring Instruments
SIH Problem Statement 26036 · Legal Metrology Act, 2009 & Rules, 2011

Status: **Active — Part 1 Mobile App Completed.** Full feature set across Owner, LMO, and Public QR Verification roles built and verified against API contracts. See `Decision.md` ADR-006 for mobile role scoping and `Memory.md` for current implementation state.

---

## 1. Problem

Verification of weighing/measuring instruments today is manual and siloed: paper applications, local-only records, no way for a consumer or regulator to confirm a certificate is genuine, and no cross-jurisdiction visibility into what's overdue. eTulamaan replaces this with one online, QR-certified, auditable system.

## 2. Goals (in priority order)

1. Let an instrument owner apply for verification/re-verification fully online, including payment.
2. Let an LMO/GATC receive, schedule, and complete inspections digitally — including offline in the field.
3. Auto-generate a QR-coded, PKI-signed digital certificate on pass; auto-issue a deficiency memo on fail.
4. Make every certificate publicly, instantly verifiable by QR scan — no login required.
5. Track validity automatically and alert owners before expiry.
6. Give admins a live dashboard of pendency, SLA, and enforcement across jurisdictions.

**Non-goals for v1:** instrument manufacturing/type-approval workflows, e-commerce integrations, IoT self-reporting instruments. Don't build these unless `Decision.md` records a scope change.

## 3. Personas

| Persona | Primary need |
|---|---|
| Instrument Owner / Trader | Apply, pay, track status, download/display certificate |
| LMO (Legal Metrology Officer) | Receive tasks, inspect (web or mobile), issue outcome |
| GATC (Govt. Approved Test Centre) | Same as LMO, third-party operator |
| Department Admin | Monitor pendency, SLAs, enforcement across jurisdictions |
| Consumer / Public | Scan QR, confirm instrument is currently certified |
| System Admin | Manage users, roles, master data, system health |

## 4. Core Flow (source of truth: the flowchart diagram)

`Register/e-KYC → Submit Application + Pay → Auto-Assign LMO/GATC → Inspection (web/mobile, offline-capable) → Pass/Fail decision → [Pass: QR+PKI Certificate → Repository] / [Fail: Deficiency Memo → resubmit] → Public QR verification + Validity tracking → Renewal reminders / Enforcement escalation`

Any change to this flow is an architecture-level decision — record it in `Decision.md`, don't just edit code.

## 5. Functional Requirements

- **FR1 Registration & Profile** — self-registration + e-KYC (Aadhaar/DigiLocker) for owners; admin-onboarded LMOs/GATCs with jurisdiction mapping.
- **FR2 Application** — instrument details, doc/photo upload, fee payment, status tracking, auto-populated re-verification.
- **FR3 Scheduling** — rule-based auto-assignment by jurisdiction/workload; manual admin override.
- **FR4 Inspection** — digital checklist, readings, tolerances, photo/geo-tag evidence; offline capture + background sync on mobile.
- **FR5 Certification** — auto-generate QR + PKI-signed certificate on pass; deficiency memo on fail.
- **FR6 Validity & Alerts** — compute next-due date per instrument category; automated SMS/email reminders before expiry; enforcement escalation on overdue.
- **FR7 Dashboards** — per-role dashboards (owner, LMO/GATC, admin); exportable reports.
- **FR8 Repository** — centralized, searchable store of certificates and instrument history; public QR verification endpoint.
- **FR9 Mobile** — Android-first field app for LMOs/GATCs, offline-first.
- **FR10 RBAC & Security** — role-based access, 2FA for officers/admins, full audit trail.
- **FR11 Payments** — government payment gateway integration for verification fees.
- **FR12 Grievance** — public can flag a suspect instrument, routed to the right jurisdiction's LMO.

Each FR maps to services described in `Architecture.md`. Don't add a new FR without updating that mapping.

## 6. Non-Functional Requirements

Security (TLS in transit, AES-256 at rest, PKI-signed certs, immutable audit trail) · Scalability (horizontal, containerized) · Availability (99.5%+) · Performance (<3s page load, <5s certificate generation) · Accessibility (WCAG 2.1 AA, multilingual) · Offline support (mobile field app) · Interoperability (Aadhaar/DigiLocker, payment gateway, state e-gov portals).

## 7. Success Metrics

Verification turnaround time · % applications fully online · compliance rate (re-verified before expiry) · certificates authenticated via public QR · CSAT per persona · uptime / API latency.

## 8. Open Questions

Track unresolved product questions here instead of guessing silently in code:

- [ ] Exact instrument-category → validity-period table (per Rules, 2011) — needs domain SME confirmation.
- [ ] Fee schedule per instrument category / state — varies by state, needs a rules table, not hardcoding.
- [ ] Which state pilots first — affects Phase 1 scope in `Architecture.md`.

If you're an agent and hit one of these while building, stop and flag it in `Decision.md` rather than inventing an answer.
