export type Role = "OWNER" | "LMO" | "GATC" | "ADMIN";

export function requireRole(userRole: Role | undefined, allowed: readonly Role[]) {
  if (!userRole || !allowed.includes(userRole)) {
    throw new Error("FORBIDDEN");
  }
  return userRole;
}
