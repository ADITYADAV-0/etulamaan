# Architecture.md

How TulaPramaan is built. This is the technical counterpart to `PRD.md`'s "what" — read both before making a structural change, and update this file (plus a `Decision.md` entry) whenever the real architecture diverges from what's written here.

## 1. Style

Microservices, not a monolith — each service in `Architecture.md §3` maps to one bounded context from the PRD's functional requirements, deployed as containers (Docker/Kubernetes), fronted by an API gateway. Chosen for independent scaling (inspection and payments have very different load profiles) and independent deployment (mobile-facing services need to ship faster than admin analytics). See `Decision.md` ADR-001 for the full rationale — don't re-litigate this choice per feature.

## 2. High-level diagram (textual)

```
[Web App] [Mobile App] ---> [API Gateway (auth, rate-limit, routing)]
                                     |
        ------------------------------------------------------
        |         |            |            |          |     |
   [Identity] [Applications] [Scheduling] [Inspection] [Certification] [Notifications]
        |         |            |            |          |     |
        ------------------------------------------------------
                                     |
                          [PostgreSQL]   [Object Storage (S3-compatible)]
                                     |
                          [Admin/Analytics service] --- [Public Verification API]
```

`Payments` sits alongside `Applications` (fee collection is part of the application flow). `Notifications` is called by `Certification` (renewal reminders) and `Admin/Analytics` (enforcement escalation).

## 3. Services

| Service | Responsibility | Primary store |
|---|---|---|
| **Identity** | Registration, e-KYC (Aadhaar/DigiLocker), auth, RBAC, jurisdiction mapping | PostgreSQL |
| **Applications** | Instrument records, application lifecycle, document/photo upload | PostgreSQL + object storage |
| **Payments** | Fee calculation, gateway integration, receipts | PostgreSQL |
| **Scheduling** | Rule-based LMO/GATC assignment, calendar/allocation | PostgreSQL |
| **Inspection** | Digital checklist, readings, evidence capture, pass/fail | PostgreSQL + object storage |
| **Certification** | QR generation, PKI signing, certificate repository, public verification | PostgreSQL |
| **Notifications** | SMS/email/push for renewals, task assignment, enforcement | — (stateless, calls gateway providers) |
| **Admin/Analytics** | Dashboards, reports, enforcement queue | Read-replica / reporting store |

## 4. Data model (core entities — expand, don't replace, without an ADR)

```
User (id, role[Owner|LMO|GATC|Admin], jurisdiction, kyc_status)
Instrument (id, owner_id, category, capacity, manufacturer, serial_no)
Application (id, instrument_id, type[new|re-verification], status, assigned_officer_id, created_at)
Inspection (id, application_id, officer_id, checklist_json, readings_json, evidence_urls[], result[pass|fail], geo, timestamp)
Certificate (id, application_id, instrument_id, qr_payload, signature, issued_at, valid_until, status[valid|expired|revoked])
DeficiencyMemo (id, application_id, notes, issued_at)
AuditLog (id, actor_id, action, entity, entity_id, timestamp) — append-only, never updated/deleted
```

`Certificate` is append-only in practice too — a re-verification creates a *new* certificate row linked to the same instrument, it never overwrites history. An instrument's full certificate history must always be reconstructable.

## 5. API design principles

- REST, resource-oriented (`/applications/:id`, not RPC-style endpoints), versioned from day one (`/v1/...`).
- Every mutating endpoint requires an authenticated, role-checked request — RBAC is enforced in the gateway *and* re-checked at the service layer (defense in depth, per `Agents.md`).
- The **public verification endpoint** (`GET /v1/public/certificates/:certId/verify`) is the one deliberately unauthenticated route — it returns only `{status, instrument_category, issued_at, valid_until}`, never owner PII.
- Idempotency keys on `Applications` submission and `Payments` initiation — mobile clients on flaky connections will retry.

## 6. Certification & security architecture

- Certificate hash + metadata signed via a licensed CA or **NIC e-Sign** — see `Decision.md` ADR-003 for why we don't run our own CA.
- QR payload = certificate ID + verification URL; the QR itself carries no authority, the API lookup does.
- TLS 1.2+ in transit, AES-256 at rest, immutable `AuditLog`.
- 2FA required for LMO/GATC/Admin roles (not owners — see ADR-004 for the UX/security tradeoff reasoning).

## 7. Mobile / offline architecture

- Local on-device store (SQLite or equivalent) mirrors the day's assigned inspections.
- Inspections are written locally first, synced when connectivity returns, keyed by a server-issued task ID assigned at scheduling time — this is what prevents duplicate-submission conflicts (see `Decision.md` ADR-005).
- Sync failures surface to the officer explicitly; never silently drop or silently overwrite a local record.

## 8. Deployment

NIC/MeghRaj government cloud (or empanelled equivalent) · Docker containers · Kubernetes orchestration · CI/CD pipeline gating on `Test.md`'s required suite · environment separation: `dev` → `staging` → `prod`, no direct-to-prod deploys.

## 9. What changes here require an ADR (not just a PR)

Adding/removing a service · changing the data model of `Certificate`, `Inspection`, or `AuditLog` · changing the signing/PKI approach · changing the offline-sync conflict strategy · changing which endpoints are public vs authenticated. Everything else is normal engineering — use judgment, but write it down in `Decision.md` if a reasonable teammate could disagree with the call.
