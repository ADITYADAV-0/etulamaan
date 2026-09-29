# Rules.md — Coding & Process Conventions

Concrete, enforceable rules. If a rule here is wrong for the project, change the rule (with a note in `Decision.md` if it's a meaningful reversal) rather than quietly ignoring it in code.

## 1. Languages & style

- **TypeScript everywhere** it's an option (backend services, web, shared packages) — no plain JS in new files. Strict mode on.
- **React** function components + hooks only, no class components.
- **Formatting**: Prettier, default config, enforced by pre-commit hook — don't hand-format, don't argue about it in review.
- **Linting**: ESLint with the repo's shared config; a PR with lint errors doesn't merge.
- Naming: `camelCase` for variables/functions, `PascalCase` for components/types/classes, `SCREAMING_SNAKE_CASE` for constants, `kebab-case` for file names except React components (`PascalCase.tsx`).

## 2. Git workflow

- **Branch naming**: `feature/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>` — branch off `main` (or the current integration branch if the team is using one).
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. Small, logical commits over one giant diff.
- **PRs**: one concern per PR. Description must state *what* and *why*, link the relevant `PRD.md` requirement or `Decision.md` ADR if applicable.
- No direct commits to `main`. No force-push to shared branches.
- Squash-merge preferred, so `main` history reads as one entry per shipped change.

## 3. Secrets & config

- **Never commit secrets, keys, or credentials** — not even "temporarily," not even in a comment. `.env` files are gitignored; commit `.env.example` with placeholder values only.
- Config is environment-driven (`dev`/`staging`/`prod`), never hardcoded per-environment URLs or keys in source.
- PKI signing keys and payment gateway credentials live in a secrets manager (per deployment target), referenced by name/ARN, never inlined.

## 4. API & service conventions

- REST, versioned (`/v1/...`), resource-oriented — see `Architecture.md §5`.
- Every service exposes a `/health` endpoint for orchestration checks.
- Input validation at the API boundary (schema validation, e.g. `zod`) — don't trust client-supplied data, including from the mobile app's sync payloads.
- Errors return a consistent shape (`{error: {code, message}}`), never a raw stack trace to the client.

## 5. Database

- Migrations only — no manual schema edits against any environment, ever.
- Every migration is reversible (write the `down` migration, don't skip it).
- `AuditLog` and `Certificate` tables are append-only at the application layer — no `UPDATE`/`DELETE` statements against them outside a documented, ADR-backed exception.

## 6. Testing gate

- No PR merges without the checks in `Test.md` passing — this is a hard gate, not a suggestion, given the domain (compliance certificates, government audit requirements).
- New functional requirements need at least one test that would fail if the requirement broke.

## 7. Domain-data discipline

- Instrument categories, validity periods, and fee schedules come from the actual Legal Metrology Rules, 2011 and state-specific fee notifications — never invent a plausible-looking number. If the real value isn't available, use an explicit placeholder (`// TODO(domain): confirm validity period for category X — see PRD.md §8`) rather than a silent guess.

## 8. PII & privacy

- Owner PII (Aadhaar-linked identity, contact info, address) is never exposed via the public verification endpoint or logged in plaintext application logs.
- Inspection evidence photos are access-controlled — visible to the assigned officer, the instrument owner, and authorized admins/auditors only.

## 9. Code review

- At least one reviewer approval before merge (or, for a solo/agent-driven build, a self-review pass against this file and `Test.md` before merging).
- Reviewer explicitly checks: does this match `PRD.md`? does it need a `Decision.md` entry? does it have tests? does it touch `Design.md`-governed UI without matching it?
