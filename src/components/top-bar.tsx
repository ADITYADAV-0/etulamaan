import Link from "next/link";
import { ArrowUpRight, Landmark, Menu, ScanLine, SearchCheck, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="topbar-brand" href="/" aria-label="eTulaMaan home">
          <BrandLogo className="topbar-mark" />
          <span className="topbar-wordmark"><strong>eTulaMaan</strong><small>LEGAL METROLOGY · INDIA</small></span>
        </Link>
        <nav className="topbar-nav" aria-label="Main navigation">
          <Link href="/verify"><SearchCheck size={17} /> Verify certificate</Link>
          <Link href="/scan"><ScanLine size={17} /> Scan QR</Link>
        </nav>
        <div className="topbar-actions">
          <span className="topbar-official"><Landmark size={15} /> Government service</span>
          <Link className="topbar-login" href="/login">Sign in <ArrowUpRight size={15} /></Link>
          <details className="topbar-mobile">
            <summary aria-label="Toggle navigation menu" aria-controls="mobile-navigation-menu">
              <Menu className="topbar-menu-open" size={21} />
              <X className="topbar-menu-close" size={21} />
            </summary>
            <nav className="topbar-mobile-menu" id="mobile-navigation-menu" aria-label="Mobile navigation">
              <Link href="/verify"><SearchCheck size={17} /> Verify certificate</Link>
              <Link href="/scan"><ScanLine size={17} /> Scan QR code</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
