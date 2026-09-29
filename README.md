# eTulaMaan

Digital verification and certification portal for weighing and measuring instruments under India's Legal Metrology Act, 2009.

## Run locally

Set `DATABASE_URL` in `.env` to your MongoDB Atlas connection string or another MongoDB replica-set URI.

```powershell
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Open `http://localhost:3000`. Public demo certificate: `ETM-2026-000001`.

Demo admin: `admin@etulamaan.gov.in` / `Demo@12345`. Development TOTP secret: `JBSWY3DPEHPK3PXP`.

All seeded category fees and validity periods are explicitly placeholder values. Replace them only with values sourced from the applicable Legal Metrology rules and state notifications.

## Product surfaces

- `/` public service landing page
- `/verify` certificate lookup
- `/verify/[certNo]` public certificate status
- `/dashboard` seeded owner workspace preview

## Architecture

The codebase follows a modular monolith under `src/modules`, with Prisma as the persistence boundary and a shared server-side RBAC guard. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
