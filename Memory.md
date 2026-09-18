# Memory.md — Project Memory

Durable context an AI agent shouldn't have to re-derive (or worse, re-guess) each session. Update this file whenever something here goes stale — don't let it silently rot; a wrong memory is worse than no memory.

## 1. Identity

- **Project name:** eTulamaan ("tula" = weighing scale, "pramaan" = certificate/proof).
- **Problem statement:** SIH 26036 — Development of an Online Verification System for Weighing and Measuring Instruments.
- **Governing law:** Legal Metrology Act, 2009 and Legal Metrology (General) Rules, 2011. The system must operate within existing law — it does not require new legislation.
- **Sibling/competing reference systems** (for differentiation, not for copying): eMaap (existing central Legal Metrology portal, emaap.gov.in), assorted state portals (e.g. legalmetrology-up.gov.in). We are more unified and add QR/PKI certification, offline mobile inspection, and public verification, which these largely lack today per our research — but verify current state before making a comparison claim in any external-facing doc, this space moves.

## 2. Domain glossary (don't relitigate these definitions)

- **LMO** — Legal Metrology Officer, a government official empowered to inspect and certify instruments.
- **GATC** — Government Approved Test Centre, a third-party entity licensed to do the same.
- **Verification** — first-time certification of an instrument.
- **Re-verification** — periodic recertification before the prior certificate expires.
- **Deficiency Memo** — formal notice issued on a failed inspection, explaining what must be corrected before resubmission.

## 3. Core decisions already made (full rationale lives in `Decision.md`)

- Microservices architecture, not a monolith (ADR-001).
- PostgreSQL for transactional data, object storage for photos/PDFs — not a single document store for everything (ADR-002).
- PKI signing via a licensed CA / NIC e-Sign, not a self-built CA (ADR-003).
- 2FA required for officer/admin roles, not for owners (ADR-004).
- Offline-first mobile sync keyed by server-issued task ID (ADR-005).

Don't reopen these without a new ADR and a real reason — re-deriving them from scratch each session wastes time and risks inconsistency.

## 4. Known unknowns (tracked, not guessed)

- Exact validity-period table per instrument category — see `PRD.md §8`.
- Fee schedule per category/state — varies, not yet finalized.
- Which state/district pilots first — affects `Architecture.md` Phase 1 scope.

## 5. Things that have already been designed once — don't redesign from scratch

- **The end-to-end lifecycle flow** (Register → Apply+Pay → Auto-assign → Inspect → Pass/Fail → Certify/Deficiency → Repository → Public verify + renewal loop) is fixed and diagrammed. If a proposed change alters this flow, that's a `PRD.md` + `Decision.md` change, not a quiet code change.
- **Brand palette and core screen layouts** — see `Design.md`. Don't introduce new colors or redesign the certificate card layout ad hoc.

## 6. Working conventions this team has settled on

- Docs-first for anything architectural: update `PRD.md`/`Architecture.md`/`Decision.md` *before or alongside* the code, not after the fact as an afterthought.
- SIH submission constraints (for anyone touching pitch materials, not the app itself): official template caps the idea deck at 6 slides total including title; detailed diagrams like the full swimlane flowchart are separate, standalone documentation artifacts, not squeezed into the pitch deck.

## 7. How to keep this file useful

Append, don't rewrite history — if a decision changes, add a dated note rather than deleting the old one, so the "why did we used to do X" question stays answerable. If this file gets long, split stable domain facts (§1–2) from evolving project state (§3–6) into separate files, but only once it's actually unwieldy, not preemptively.
