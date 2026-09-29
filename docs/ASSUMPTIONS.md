# Assumptions

- The first implementation uses a UI-first vertical slice with deterministic demo data so public verification and role dashboards can be exercised before connecting persistence.
- Master categories use placeholder fees and validity periods only; no Legal Metrology fee or validity value is presented as real.
- MongoDB is the persistence provider; document IDs and relation keys use ObjectIds, and monetary amounts are stored as integer paise for exact arithmetic.
- The public demo certificate is `ETM-2026-000001`; unknown numbers are treated as not found until the database-backed verification API is connected.
- The first pass uses an in-browser theme and language control; production i18n message catalogs are scaffolded in the next implementation slice.
