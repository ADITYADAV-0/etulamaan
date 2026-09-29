export type PortalRole = "OWNER" | "OFFICER" | "ADMIN";
export type DemoUser = { email: string; password: string; name: string; role: PortalRole };

export const demoUsers: DemoUser[] = [
  { email: "owner@etulamaan.gov.in", password: "Owner@123", name: "Ananya Sharma", role: "OWNER" },
  { email: "officer@etulamaan.gov.in", password: "Officer@123", name: "Rajiv Mehta", role: "OFFICER" },
  { email: "admin@etulamaan.gov.in", password: "Admin@123", name: "System Administrator", role: "ADMIN" },
];

export function findDemoUser(email: string, password: string) {
  return demoUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password);
}
