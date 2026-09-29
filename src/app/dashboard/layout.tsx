import { AuthGate } from "@/components/auth-gate";
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <AuthGate role="OWNER">{children}</AuthGate>; }
