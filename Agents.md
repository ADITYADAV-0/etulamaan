# Agents.md — Working Agreement for AI Coding Agents

This file is what any AI agent (Claude Code or otherwise) should read first when working in this repo. It tells you what the project is, how the repo is organized, who "owns" what, and the rules for making changes safely. If something here conflicts with what you observe in the code, the code wins — but flag the mismatch in `Decision.md` rather than silently picking one.

## 1. Project in one paragraph

eTulamaan is a government verification-and-certification platform for weighing/measuring instruments (SIH PS 26036). Four user roles (Owner, LMO, GATC, Admin) interact through a web dashboard, a mobile field-inspection app, and a public no-login certificate-verification page. Read `PRD.md` for what it does and `Architecture.md` for how it's built before changing anything non-trivial.

## 2. Required reading order for a new agent/session

1. `PRD.md` — what we're building and why
2. `Architecture.md` — how the system is structured
3. `Memory.md` — domain facts and prior context you must not re-derive or contradict
4. `Rules.md` — coding conventions
5. `Decision.md` — check for an existing ADR before making an architectural choice
6. `Design.md` — before touching anything UI-facing
7. `Test.md` — before writing or skipping tests

## 3. Repo layout (target structure)

```
/apps
  /web            # React/Next.js dashboards (Owner, LMO/GATC, Admin)
  /mobile         # React Native field-inspection app (offline-first)
/services
  /identity       # registration, e-KYC, auth, RBAC
  /applications    # instrument + application lifecycle
  /scheduling     # assignment engine
  /inspection     # checklist, evidence, pass/fail
  /certification  # QR + PKI signing, certificate repository
  /notifications  # SMS/email/push alerts
  /payments       # fee collection, gateway integration
  /admin-analytics # dashboards, reports, enforcement
/packages
  /shared-types   # cross-service TypeScript types / API contracts
  /ui-kit         # shared design-system components (see Design.md)
/infra            # IaC, Docker/Kubernetes manifests, CI config
/docs             # this file and its siblings
```

If the actual repo doesn't match this yet, that's expected early on — build toward it, and update this section (not silently diverge from it) once the real structure stabilizes.

## 4. Agent roles (if working as a multi-agent team)

| Agent | Owns | Must coordinate with |
|---|---|---|
| **Backend agent** | `/services/*` | Shared-types agent before changing any API contract |
| **Frontend agent** | `/apps/web` | UI-kit agent for anything not already a component |
| **Mobile agent** | `/apps/mobile` | Backend agent on offline-sync contract; this is the highest-risk integration point |
| **Design/UI-kit agent** | `/packages/ui-kit`, `Design.md` | Frontend + mobile agents on breaking component changes |
| **DevOps agent** | `/infra` | Everyone, before changing deploy topology |
| **QA agent** | `/tests`, `Test.md` | All of the above — tests are not optional side work |

A single agent working solo still follows these boundaries mentally: don't casually reshape another "area" while heads-down on a feature in a different one.

## 5. Ground rules

- **Don't invent domain facts.** Instrument categories, validity periods, and fee structures come from the Legal Metrology Rules, 2011 — if you don't have the real table, leave a `TODO` and flag it in `PRD.md` §8, don't hardcode a guess as if it were confirmed.
- **Certificates are legally meaningful artifacts.** Never weaken PKI signing, hash verification, or the audit trail to "make a demo work" — mock the signing service in dev instead of removing the check.
- **Offline-first is a hard requirement for mobile inspection**, not a nice-to-have. Don't merge a mobile change that assumes connectivity.
- **RBAC is enforced server-side, always.** UI-level role hiding is a UX convenience, never the actual access control.
- **No secrets in code or commits.** Env vars only, see `Rules.md`.
- **Record decisions, don't just make them.** Any choice that changes architecture, data model, or a documented flow gets an entry in `Decision.md` before (or immediately after) implementation.
- **When requirements are ambiguous, check `PRD.md` §8 (Open Questions) first.** If it's not there either, add it rather than silently assuming.

## 6. How to run things (fill in as the repo materializes)

```bash
# Backend services (example — adjust per actual service)
cd services/<service-name> && npm install && npm run dev

# Web app
cd apps/web && npm install && npm run dev

# Mobile app
cd apps/mobile && npm install && npx expo start   # or react-native run-android

# Full test suite
npm run test        # see Test.md for what this covers and what it doesn't
```

Keep this section accurate. A stale "how to run this" section is worse than no section — it wastes the next agent's first ten minutes.

## 7. Definition of done

A change is done when: it matches `PRD.md`, follows `Rules.md`, has tests per `Test.md`, doesn't contradict `Architecture.md` without a corresponding `Decision.md` entry, and — if it's UI-facing — matches `Design.md`. "It compiles" is not done.
