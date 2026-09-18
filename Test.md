# Test.md — Testing Strategy

What gets tested, how, and what "passing" means before a PR merges. This is a compliance/certification system — a bug in the pass/fail or certificate-signing path isn't just a UX annoyance, it's a false government record. Test accordingly.

## 1. Test pyramid

- **Unit tests** — every service's business logic (fee calculation, validity-date computation, RBAC checks, checklist scoring). Fast, no network, no DB — mock external calls.
- **Integration tests** — service-to-service and service-to-DB behavior (e.g. "submitting an application actually creates a schedulable task"; "a signed certificate actually verifies against the public endpoint").
- **End-to-end tests** — full user journeys through the UI: owner registers → applies → pays → officer inspects → certificate issued → public QR verification succeeds. At minimum, both the pass path and the fail/resubmit path.
- **Manual/exploratory QA** — mobile offline behavior, real-device camera/GPS capture, low-connectivity simulation — these are hard to fully automate and need periodic manual passes.

## 2. Tooling

| Layer | Tool |
|---|---|
| Backend unit/integration | Jest (or the service's language-native equivalent) + Supertest for HTTP |
| Frontend unit | Jest + React Testing Library |
| E2E (web) | Playwright |
| E2E (mobile) | Detox or Appium, plus manual device testing for camera/GPS/offline |
| API contract testing | Postman/Newman collection, or OpenAPI-schema validation in CI |
| Load testing | k6 or similar, targeted at `Inspection` submission and `Certification` generation under burst load |

## 3. Required coverage before merge (the hard gate referenced in `Rules.md §6`)

- New API endpoint → integration test covering success + at least one auth-failure + one validation-failure case.
- New UI flow → at least one E2E happy-path test.
- Any change touching `Certificate`, `Inspection`, or `AuditLog` tables → an integration test proving the audit trail is still append-only and the certificate signature still validates.
- Bug fix → a regression test that fails on the old code and passes on the fix, added in the same PR.

No numeric "80% coverage" mandate — coverage percentage is a weak proxy. The actual bar is: **could this specific change silently break a certified instrument's status or a compliance record without a test catching it?** If yes, it needs a test regardless of overall coverage numbers.

## 4. Domain-specific test scenarios (don't skip these)

- Application submitted → officer marks **fail** → deficiency memo issued → applicant resubmits → new inspection scheduled correctly (not silently reusing stale data from the failed attempt).
- Certificate generated → QR scanned → public endpoint returns `valid` while within validity period, `expired` after, and `revoked` if an admin revokes it manually.
- Mobile inspection completed fully offline → app regains connectivity → sync succeeds exactly once (no duplicate inspection record created) — this is the highest-risk path per `Decision.md` ADR-005, test it explicitly, including the "two inspections synced out of order" edge case.
- Role-based access: a GATC officer's API calls never return another GATC's applications, even with a manipulated request (test this at the API layer, not just by checking the UI hides it).
- Payment failure mid-application → application does not silently advance to "scheduled" without confirmed payment.

## 5. CI pipeline gate

On every PR: lint → unit tests → integration tests → build. On merge to the integration branch: full E2E suite against a staging-like environment. Deploy to `staging` only after all of the above pass; deploy to `prod` only after a manual approval step, per `Architecture.md §8`.

## 6. Test data

Use clearly fake, clearly-labeled synthetic data (`TEST-` prefixed instrument IDs, obviously fictional names) — never real Aadhaar numbers, real instrument serials, or real officer credentials in any test fixture, even a "throwaway" one. Seed scripts for local/dev environments live alongside each service, not hand-created ad hoc per developer.

## 7. What "done" testing looks like for a feature

Matches the "Definition of done" in `Agents.md §7`: the specific behavior in `PRD.md` is covered by at least one test that would fail if the behavior broke, the domain-specific scenarios in §4 above are considered (not necessarily all re-tested every time, but reviewed for relevance), and CI is green.
