import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const categories = ["A", "B", "C", "D", "E"].map((letter) => ({ name: `Category ${letter} (placeholder)`, validityMonths: 12, baseFee: 100, checklistTemplateJson: [{ key: "seal", label: "Seal intact", required: true }] }));

async function main() {
  const passwordHash = await bcrypt.hash("Demo@12345", 12);
  await prisma.masterCategory.createMany({ data: categories, skipDuplicates: true });
  await prisma.user.upsert({ where: { email: "admin@etulamaan.gov.in" }, update: {}, create: { name: "System Administrator", email: "admin@etulamaan.gov.in", passwordHash, role: Role.ADMIN, jurisdiction: "Delhi", kycStatus: "VERIFIED", totpSecret: "JBSWY3DPEHPK3PXP" } });
  console.log("Seeded placeholder categories and demo admin.");
  console.log("Demo credentials: admin@etulamaan.gov.in / Demo@12345 / TOTP JBSWY3DPEHPK3PXP");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
