import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, ScanLine, SearchCheck, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/top-bar";

const features = [
  { icon: SearchCheck, title: "Verify certificates", text: "Check a certificate number and confirm its current legal status." },
  { icon: ClipboardCheck, title: "Apply online", text: "Submit instruments, documents, and fees through one guided application." },
  { icon: ShieldCheck, title: "Traceable decisions", text: "Every inspection and certificate event is secured with an audit trail." },
];

export default function Home() {
  return <div className="site-shell"><TopBar /><main><section className="hero-band"><div className="hero-grid" /><div className="hero-content"><p className="eyebrow">Government of India · Legal Metrology</p><h1>Measure with confidence.</h1><p className="hero-copy">eTulaMaan brings instrument verification, inspections, and digital certification into one trusted public service.</p><div className="hero-actions"><Link className="button button-primary" href="/verify">Verify by certificate number <ArrowRight size={17} /></Link><Link className="button button-light" href="/scan"><ScanLine size={17} /> Scan QR code</Link><Link className="button button-hero-quiet" href="/login">Open portal</Link></div><p className="hero-note"><BadgeCheck size={16} /> Certificate records are digitally signed and independently verifiable.</p></div><div className="hero-stat"><span className="stat-label">Public verification</span><strong>24 × 7</strong><span>Open access to certificate status</span></div></section><section className="feature-section"><div className="section-heading"><p className="eyebrow">One connected workflow</p><h2>From application to assurance.</h2></div><div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-item" key={title}><div className="feature-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></section><section className="public-strip"><div><p className="eyebrow">Already have a certificate?</p><h2>Confirm it before you trade.</h2></div><div className="public-actions"><Link className="text-link" href="/verify">Enter certificate number <ArrowRight size={16} /></Link><Link className="text-link" href="/scan"><ScanLine size={16} /> Scan QR instead</Link></div></section></main><footer className="footer"><span>eTulaMaan</span><span>Digital legal metrology services</span></footer></div>;
}
