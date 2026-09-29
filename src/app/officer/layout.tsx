import { AuthGate } from "@/components/auth-gate";
export default function OfficerLayout({ children }: { children: React.ReactNode }) { return <AuthGate role="OFFICER">{children}</AuthGate>; }
