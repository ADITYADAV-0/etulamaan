import { AuthGate } from "@/components/auth-gate";
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AuthGate role="ADMIN">{children}</AuthGate>; }
