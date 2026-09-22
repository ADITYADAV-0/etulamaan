# eTulamaan

**Unified Online Verification & Digital Certification Platform for Weighing & Measuring Instruments**

SIH Problem Statement **26036** · Built under the Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011

> Replaces India's manual, paper-based legal metrology verification process with one online, QR-certified, publicly auditable system — from application to inspection to public authentication.

---

## Table of Contents

- [The Problem](#the-problem)
- [What eTulamaan Does](#what-etulamaan-does)
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

- **Online registration** for instrument owners and LMOs with e-KYC (Aadhaar/DigiLocker)
- **Fully online applications** for verification and re-verification, including fee payment (Bharatkosh stub)
- **Rule-based scheduling** that assigns inspections to the right LMO officer
- **Offline-first mobile inspection app** for field officers — checklist, readings, geo-tagged photos, auto-syncs when connectivity returns per ADR-005
- **QR-coded, PKI-signed digital certificates**, generated automatically on a passed inspection
- **Public, no-login certificate verification** — anyone can scan a QR code and instantly see Valid / Expired / Revoked without owner PII
- **Automated validity tracking and renewal reminders** before a certificate expires
- **Multilingual i18n support** (English & Hindi) and dark mode compliance (`Design.md §1`)

## System Architecture

Microservices behind an API gateway, each service owning one bounded context of the verification lifecycle. Full rationale in [`Architecture.md`](Architecture.md).

```mermaid
flowchart TB
    subgraph CLIENTS["Clients"]
        MOB["Mobile App<br/>(Owner / LMO / Public QR Scanner)"]
        PUBV["Public Verification Page<br/>(no login)"]
    end

    GW["API Gateway<br/>(auth · RBAC · rate-limit · routing)"]

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
    end

    GW --> ID
    GW --> APPS
    GW --> PAY
    GW --> SCH
    GW --> INS
    GW --> CERT

    APPS --> PAY
    SCH --> INS
    INS --> CERT
    CERT --> NOT

    DB[("PostgreSQL")]
    OBJ[("Object Storage<br/>(photos, PDFs)")]

    ID --> DB
    APPS --> DB
    APPS --> OBJ
    INS --> DB
    INS --> OBJ
    CERT --> DB
```

## End-to-End Workflow

Cross-functional lifecycle across actors in the system. Full breakdown in [`PRD.md`](PRD.md).

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

    subgraph VERIFIER["📋 LMO (Verifier)"]
        L1["Receive Task"]
        L2["Conduct Inspection<br/>(checklist, photos, offline sync)"]
        D{"Pass / Fail?"}
    end

    A1 --> A2 --> P1 --> L1 --> L2 --> D
    D -- Pass --> P2 --> P3 --> A6
    D -- Fail --> P4
    P4 -.->|applicant corrects & resubmits| A2
    P3 -.->|renewal reminder| A2

    style APPLICANT fill:#EAF0F8,stroke:#1F3864
    style PLATFORM fill:#E7F0FA,stroke:#0070C0
    style VERIFIER fill:#EAF5EE,stroke:#1E7A46
```

## Certificate Issuance & Verification

What happens under the hood from a passed inspection to a consumer scanning the QR code.

```mermaid
sequenceDiagram
    actor Owner
    participant App as Mobile App
    participant GW as API Gateway
    participant Insp as Inspection Service
    participant Cert as Certification Service
    participant Pub as Public Verify API
    actor Consumer

    Owner->>App: Submit application + pay fee
    App->>GW: POST /v1/applications
    GW->>Insp: Schedule & assign LMO
    Note over Insp: Officer inspects (offline mobile app)
    Insp-->>GW: Inspection result: Pass (ADR-005 sync)
    GW->>Cert: Request certificate generation
    Cert->>Cert: Sign certificate hash (PKI / NIC e-Sign)
    Cert-->>GW: QR-coded, signed certificate
    GW-->>Owner: Certificate ready for download

    Consumer->>Pub: Scan QR → GET /v1/public/certificates/:id/verify
    Pub-->>Consumer: { status: "valid", category, valid_until, serialNoMasked }
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (offline-first, Android priority) |
| Shared packages | TypeScript (`@etulamaan/shared-types`, `@etulamaan/ui-kit`) |
| Backend service | Node.js (Express) Mock API server (`@etulamaan/mock-api`), REST APIs |
| Database | PostgreSQL (transactional) |
| File storage | S3-compatible object storage (photos, PDFs) |
| Auth | OAuth2 / JWT, RBAC, 2FA for officers (ADR-004) |
| Certificate signing | PKI via licensed CA / NIC e-Sign |
| Payments | Government payment gateway (Bharatkosh / PayGov) |

## Repository Structure

```
/apps
  /mobile           # React Native field-inspection app (offline-first, Owner, LMO, Public)
/services
  /mock-api         # Backend API server matching Architecture.md contracts & ADR-005 sync
/packages
  /shared-types     # Cross-service TypeScript types / API contracts
  /ui-kit           # Shared design-system components & tokens
/infra              # IaC, Docker/Kubernetes manifests, CI config
```

## Getting Started

```bash
# Clone
git clone <repo-url> && cd eTulamaan

# Start Backend Mock API Service
npm --prefix services/mock-api start

# Run API & ADR-005 Integration Tests
npm --prefix services/mock-api test

# Start Mobile App (Expo / React Native)
npm --prefix apps/mobile start
```

See [`Agents.md`](Agents.md) for repo conventions and [`Test.md`](Test.md) for what the test suite covers.

## Roles & Access

| Role | Can do |
|---|---|
| **Owner** | Self-register + e-KYC, submit applications, pay fees, download certificates |
| **LMO** | Receive assigned inspections, conduct offline inspections, issue pass/fail, sync results |
| **Public / Consumer** | Scan QR code to verify a certificate — no login required, zero owner PII |

RBAC is enforced server-side on every request — see [`Rules.md`](Rules.md).

## Project Documentation

| Doc | Covers |
|---|---|
| [`PRD.md`](PRD.md) | Product requirements, personas, success metrics |
| [`Agents.md`](Agents.md) | How AI/dev agents should work in this repo |
| [`Design.md`](Design.md) | Brand palette, typography, UI patterns, key screens |
| [`Architecture.md`](Architecture.md) | Services, data model, API & security design |
| [`Rules.md`](Rules.md) | Coding, git, secrets, and review conventions |
| [`Memory.md`](Memory.md) | Domain glossary and durable project context |
| [`Decision.md`](Decision.md) | Architecture Decision Records (ADRs) |
| [`Test.md`](Test.md) | Testing strategy and required coverage |

---

<sub>Built for Smart India Hackathon — Problem Statement 26036.</sub>
