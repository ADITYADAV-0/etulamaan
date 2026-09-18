# eTulamaan

**Unified Online Verification & Digital Certification Platform for Weighing & Measuring Instruments**

SIH Problem Statement **26036** · Built under the Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011

> Replaces India's manual, paper-based legal metrology verification process with one online, QR-certified, publicly auditable system — from application to inspection to public authentication.

---

## Table of Contents

- [The Problem](#the-problem)
- [What eTulamaan Does](#what-eTulamaan-does)
- [System Architecture](#system-architecture)
- [End-to-End Workflow](#end-to-end-workflow)
- [Certificate Issuance & Verification](#certificate-issuance--verification)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Roles & Access](#roles--access)
- [Project Documentation](#project-documentation)
- [Contributing](#contributing)

---

## The Problem

Verification of weighing and measuring instruments today is manual and siloed: paper applications, disconnected local record-keeping, no way for a consumer or regulator to confirm a certificate is genuine, and no cross-jurisdiction visibility into what's overdue for re-verification. eTulamaan digitizes every step of this lifecycle into one national, auditable platform.

## What eTulamaan Does

- **Online registration** for instrument owners, LMOs, and GATCs, with e-KYC (Aadhaar/DigiLocker)
- **Fully online applications** for verification and re-verification, including fee payment
- **Rule-based scheduling** that auto-assigns inspections to the right LMO/GATC
- **Offline-first mobile inspection app** for field officers — checklist, readings, geo-tagged photos, syncs when connectivity returns
- **QR-coded, PKI-signed digital certificates**, generated automatically on a passed inspection
- **Public, no-login certificate verification** — anyone can scan a QR code and instantly see Valid / Expired / Revoked
- **Automated validity tracking and renewal reminders** before a certificate expires
- **Admin dashboards** for pendency, SLA compliance, and enforcement across jurisdictions

## System Architecture

Microservices behind an API gateway, each service owning one bounded context of the verification lifecycle. Full rationale in [`docs/Architecture.md`](docs/Architecture.md).

```mermaid
flowchart TB
    subgraph CLIENTS["Clients"]
        WEB["Web App<br/>(Owner / LMO / GATC / Admin)"]
        MOB["Mobile App<br/>(Field Inspection, offline-first)"]
        PUBV["Public Verification Page<br/>(no login)"]
    end

    GW["API Gateway<br/>(auth · RBAC · rate-limit · routing)"]

    WEB --> GW
    MOB --> GW
    PUBV --> GW

    subgraph SERVICES["Services"]
        ID["Identity<br/>(auth, e-KYC, RBAC)"]
        APPS["Applications<br/>(instrument + application lifecycle)"]
        PAY["Payments<br/>(fees, gateway)"]
        SCH["Scheduling<br/>(auto-assignment engine)"]
        INS["Inspection<br/>(checklist, evidence, pass/fail)"]
        CERT["Certification<br/>(QR + PKI signing, repository)"]
        NOT["Notifications<br/>(SMS / email / push)"]
        ADM["Admin & Analytics<br/>(dashboards, enforcement)"]
    end

    GW --> ID
    GW --> APPS
    GW --> PAY
    GW --> SCH
    GW --> INS
    GW --> CERT
    GW --> ADM

    APPS --> PAY
    SCH --> INS
    INS --> CERT
    CERT --> NOT
    ADM --> NOT

    DB[("PostgreSQL")]
    OBJ[("Object Storage<br/>(photos, PDFs)")]

    ID --> DB
    APPS --> DB
    APPS --> OBJ
    INS --> DB
    INS --> OBJ
    CERT --> DB
    ADM --> DB
```

## End-to-End Workflow

Cross-functional lifecycle across the four actors in the system. Solid arrows are the main process flow; dashed arrows are data feeds and notification loops. Full breakdown in [`docs/PRD.md`](docs/PRD.md).

```mermaid
flowchart LR
    subgraph APPLICANT["👤 Applicant / Instrument Owner"]
        A1["Register & e-KYC"]
        A2["Submit Application<br/>+ Pay Fee"]
        A6["Download Certificate /<br/>Public QR Verify"]
    end

    subgraph PLATFORM["🖥️ Platform / System"]
        P1["Validate &<br/>Auto-Assign"]
        P2["Generate QR-Signed<br/>Certificate"]
        P3["Repository &<br/>Auto Alerts"]
        P4["Deficiency Memo"]
    end

    subgraph VERIFIER["📋 LMO / GATC (Verifier)"]
        L1["Receive Task"]
        L2["Conduct Inspection<br/>(checklist, photos, offline sync)"]
        D{"Pass / Fail?"}
    end

    subgraph ADMIN["📊 Admin / Enforcement"]
        AD1["Monitoring Dashboard"]
        AD2["Enforcement Escalation"]
    end

    A1 --> A2 --> P1 --> L1 --> L2 --> D
    D -- Pass --> P2 --> P3 --> A6
    D -- Fail --> P4
    P4 -.->|applicant corrects & resubmits| A2
    P3 -.->|renewal reminder| A2
    P3 -.->|feeds| AD1
    P3 -.->|overdue feed| AD2
    AD2 -.->|compliance notice /<br/>re-inspection order| A2

    style APPLICANT fill:#EAF0F8,stroke:#1F3864
    style PLATFORM fill:#E7F0FA,stroke:#0070C0
    style VERIFIER fill:#EAF5EE,stroke:#1E7A46
    style ADMIN fill:#FBF3E3,stroke:#C69214
```

## Certificate Issuance & Verification

What happens under the hood from a passed inspection to a consumer scanning the QR code.

```mermaid
sequenceDiagram
    actor Owner
    participant App as Web / Mobile App
    participant GW as API Gateway
    participant Insp as Inspection Service
    participant Cert as Certification Service
    participant Pub as Public Verify API
    actor Consumer

    Owner->>App: Submit application + pay fee
    App->>GW: POST /v1/applications
    GW->>Insp: Schedule & assign LMO/GATC
    Note over Insp: Officer inspects (web or offline mobile)
    Insp-->>GW: Inspection result: Pass
    GW->>Cert: Request certificate generation
    Cert->>Cert: Sign certificate hash (PKI / NIC e-Sign)
    Cert-->>GW: QR-coded, signed certificate
    GW-->>Owner: Certificate ready for download

    Consumer->>Pub: Scan QR → GET /v1/public/certificates/:id/verify
    Pub-->>Consumer: { status: "valid", category, issued_at, valid_until }
```

## Data Model

Core entities — see [`docs/Architecture.md`](docs/Architecture.md) for the full field list and constraints (`AuditLog` and `Certificate` are append-only).

```mermaid
erDiagram
    USER ||--o{ INSTRUMENT : owns
    INSTRUMENT ||--o{ APPLICATION : "has"
    APPLICATION ||--o| INSPECTION : "results in"
    APPLICATION ||--o| CERTIFICATE : issues
    APPLICATION ||--o| DEFICIENCY_MEMO : "may issue"
    USER ||--o{ AUDIT_LOG : performs

    USER {
        string id
        string role "Owner | LMO | GATC | Admin"
        string jurisdiction
        string kyc_status
    }
    INSTRUMENT {
        string id
        string category
        string serial_no
        string owner_id
    }
    APPLICATION {
        string id
        string type "new | re-verification"
        string status
        string assigned_officer_id
    }
    INSPECTION {
        string id
        string result "pass | fail"
        string geo
        string evidence_urls
    }
    CERTIFICATE {
        string id
        string qr_payload
        string signature
        string valid_until
        string status "valid | expired | revoked"
    }
    DEFICIENCY_MEMO {
        string id
        string notes
        string issued_at
    }
    AUDIT_LOG {
        string id
        string action
        string entity
        string timestamp
    }
```

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | React / Next.js, Tailwind CSS |
| Mobile app | React Native (offline-first, Android priority) |
| Backend | Node.js (Express) / Spring Boot, REST APIs |
| Database | PostgreSQL (transactional) |
| File storage | S3-compatible object storage (photos, PDFs) |
| Auth | OAuth2 / JWT, RBAC, 2FA for officers/admins |
| Certificate signing | PKI via licensed CA / NIC e-Sign |
| Notifications | SMS / email / push (Firebase Cloud Messaging) |
| Payments | Government payment gateway (Bharatkosh / PayGov) |
| Deployment | Docker, Kubernetes, NIC / MeghRaj government cloud |

Full stack rationale: [`docs/Architecture.md`](docs/Architecture.md).

## Repository Structure

```
/apps
  /web              # React/Next.js dashboards (Owner, LMO/GATC, Admin)
  /mobile           # React Native field-inspection app (offline-first)
/services
  /identity         # registration, e-KYC, auth, RBAC
  /applications     # instrument + application lifecycle
  /scheduling       # assignment engine
  /inspection       # checklist, evidence, pass/fail
  /certification    # QR + PKI signing, certificate repository
  /notifications    # SMS/email/push alerts
  /payments         # fee collection, gateway integration
  /admin-analytics  # dashboards, reports, enforcement
/packages
  /shared-types     # cross-service TypeScript types / API contracts
  /ui-kit           # shared design-system components
/infra              # IaC, Docker/Kubernetes manifests, CI config
/docs               # PRD, architecture, design, rules, decisions, tests
```

## Getting Started

```bash
# Clone
git clone <repo-url> && cd eTulamaan

# Backend service (example — repeat per service)
cd services/<service-name> && npm install && npm run dev

# Web app
cd apps/web && npm install && npm run dev

# Mobile app
cd apps/mobile && npm install && npx expo start

# Full test suite
npm run test
```

See [`docs/Agents.md`](docs/Agents.md) for repo conventions and [`docs/Test.md`](docs/Test.md) for what the test suite actually covers.

## Roles & Access

| Role | Can do |
|---|---|
| **Owner** | Register instruments, submit applications, pay fees, download certificates |
| **LMO** | Receive assigned inspections, conduct inspections (web/mobile), issue pass/fail |
| **GATC** | Same as LMO, for third-party-authorized centres |
| **Admin** | Monitor dashboards, manage users/master data, handle enforcement |
| **Public / Consumer** | Scan QR to verify a certificate — no login required |

RBAC is enforced server-side on every request, not just hidden in the UI — see [`docs/Rules.md`](docs/Rules.md).

## Project Documentation

| Doc | Covers |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements, personas, success metrics |
| [`docs/Agents.md`](docs/Agents.md) | How AI/dev agents should work in this repo |
| [`docs/Design.md`](docs/Design.md) | Brand, typography, UI patterns, key screens |
| [`docs/Architecture.md`](docs/Architecture.md) | Services, data model, API & security design |
| [`docs/Rules.md`](docs/Rules.md) | Coding, git, secrets, and review conventions |
| [`docs/Memory.md`](docs/Memory.md) | Domain glossary and durable project context |
| [`docs/Decision.md`](docs/Decision.md) | Architecture Decision Records (ADRs) |
| [`docs/Test.md`](docs/Test.md) | Testing strategy and required coverage |

## Contributing

Read [`docs/Agents.md`](docs/Agents.md) and [`docs/Rules.md`](docs/Rules.md) before opening a PR. In short: one concern per PR, Conventional Commits, tests required per [`docs/Test.md`](docs/Test.md), and any architectural change needs an ADR in [`docs/Decision.md`](docs/Decision.md).

---

<sub>Built for Smart India Hackathon — Problem Statement 26036.</sub>
