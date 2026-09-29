"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PortalRole } from "@/lib/demo-auth";
export function AuthGate({ children, role }: { children: React.ReactNode; role: PortalRole }) { const router = useRouter(); const [allowed, setAllowed] = useState(false); useEffect(() => { try { const raw = localStorage.getItem("etulamaan_user"); const user = raw ? JSON.parse(raw) as { role?: PortalRole } : null; if (user?.role !== role) router.replace("/login"); else setAllowed(true); } catch { router.replace("/login"); } }, [role, router]); if (!allowed) return <main className="loading-page" aria-label="Checking access"><div className="loading-mark">eT</div><p>Checking secure access</p></main>; return children; }
