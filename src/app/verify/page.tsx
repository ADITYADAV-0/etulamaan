"use client";

import Link from "next/link";
import { ArrowLeft, ScanLine, Search, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { TopBar } from "@/components/top-bar";

export default function VerifyPage() {
  const [certificate, setCertificate] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (certificate.trim()) window.location.href = `/verify/${certificate.trim()}`; };
  return <div className="site-shell"><TopBar /><main className="center-page"><Link className="back-link" href="/"><ArrowLeft size={15} /> Back to home</Link><div className="verify-card"><div className="feature-icon"><ShieldCheck size={24} /></div><p className="eyebrow">Public certificate service</p><h1>Verify a certificate</h1><p>Enter the certificate number printed on the instrument certificate to view its current status.</p><form onSubmit={submit} className="verify-form"><label htmlFor="certNo">Certificate number</label><div className="input-with-icon"><Search size={18} /><input id="certNo" value={certificate} onChange={(event) => setCertificate(event.target.value)} placeholder="e.g. ETM-2026-000001" required /></div><button className="button button-primary" type="submit">Check certificate <ArrowLeft size={16} className="rotate-180" /></button></form><Link className="scan-verify-link" href="/scan"><ScanLine size={16} /> Scan the QR code instead</Link><p className="form-note">No owner details or private documents are shown on this public service.</p></div></main></div>;
}
