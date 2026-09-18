# Decision.md — Architecture Decision Records

Log of significant decisions, in ADR format. Append new entries at the bottom with the next sequential ID — never renumber or delete a past entry, even a superseded one (mark it superseded instead, so the history stays honest).

**Format:** ID · Date · Status (Proposed / Accepted / Superseded) · Context · Decision · Consequences.

---

### ADR-001 — Microservices architecture over a monolith

- **Status:** Accepted
- **Context:** Inspection (mobile, bursty, offline-tolerant), payments (transactional, compliance-sensitive), and admin analytics (read-heavy, reporting) have very different load and deployment profiles. A monolith would couple their release cycles and scaling needs unnecessarily.
- **Decision:** Split into bounded-context services (Identity, Applications, Payments, Scheduling, Inspection, Certification, Notifications, Admin/Analytics) per `Architecture.md §3`, behind an API gateway.
- **Consequences:** More operational complexity (service discovery, distributed tracing, more deploy pipelines) in exchange for independent scaling/deployment. Requires discipline on API contracts between services (`packages/shared-types`).

### ADR-002 — PostgreSQL + object storage, not one document store

- **Status:** Accepted
- **Context:** Core records (users, applications, certificates) are relational and need referential integrity and auditability. Inspection photos and generated PDFs are large, unstructured, and don't need relational constraints.
- **Decision:** PostgreSQL for transactional data; S3-compatible object storage for photos/PDFs, referenced by URL from PostgreSQL rows.
- **Consequences:** Two systems to operate instead of one, but each does what it's actually good at; avoids bloating the relational DB with binary blobs.

### ADR-003 — PKI signing via licensed CA / NIC e-Sign, not a self-built CA

- **Status:** Accepted
- **Context:** Certificates need legally credible, tamper-evident digital signatures. Building and operating our own Certificate Authority is a large, security-critical undertaking outside this project's scope and expertise.
- **Decision:** Integrate with an existing licensed CA or NIC's e-Sign service — the same infrastructure other Indian government digital-signature use cases already rely on.
- **Consequences:** Dependency on an external service's availability and API; in exchange, we inherit its legal standing and security posture instead of building and maintaining our own.

### ADR-004 — 2FA required for officers/admins, not for instrument owners

- **Status:** Accepted
- **Context:** LMOs/GATCs/Admins can issue certificates and take enforcement actions — the security stakes of a compromised officer account are much higher than a compromised owner account (which can, at most, submit a fraudulent-looking application that still needs a real inspection to be certified).
- **Decision:** Mandatory 2FA for LMO/GATC/Admin roles; standard password (+ optional 2FA) for owners.
- **Consequences:** Slightly reduced friction for the largest, least technical user group (owners), while keeping the highest-privilege accounts well protected. Revisit if fraud patterns emerge on the owner side.

### ADR-005 — Offline mobile sync keyed by server-issued task ID

- **Status:** Accepted
- **Context:** Field inspections routinely happen without connectivity. We need a sync strategy that avoids duplicate or conflicting inspection records when the officer's device reconnects.
- **Decision:** Every inspection task gets a unique ID at scheduling time (server-side, before the officer goes offline). The mobile app writes locally against that ID; on sync, the server treats it as an idempotent upsert keyed by task ID rather than a blind insert.
- **Consequences:** Requires scheduling to always happen online (before the officer heads into the field) — an inspection can't be freely created client-side with no server-known task ID. This is an acceptable constraint given the existing assignment workflow.

---

## Template for new entries

```
### ADR-XXX — <short title>

- **Status:** Proposed | Accepted | Superseded (by ADR-YYY)
- **Context:** <what problem forced this decision>
- **Decision:** <what we decided>
- **Consequences:** <what this costs us, what it buys us>
```
