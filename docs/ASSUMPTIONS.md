# Assumptions

- The first implementation uses a UI-first vertical slice with deterministic demo data so public verification and role dashboards can be exercised before connecting persistence.
- Master categories use placeholder fees and validity periods only; no Legal Metrology fee or validity value is presented as real.
- Local development defaults to SQLite in the environment example, while the Prisma schema uses PostgreSQL-compatible field types and relations.
- The public demo certificate is `ETM-2026-000001`; unknown numbers are treated as not found until the database-backed verification API is connected.
- The first pass uses an in-browser theme and language control; production i18n message catalogs are scaffolded in the next implementation slice.
