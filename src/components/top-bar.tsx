"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="topbar-context">Legal Metrology Portal</span>
        <div className="topbar-actions">
          <Link className="topbar-login" href="/login">Sign in</Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
