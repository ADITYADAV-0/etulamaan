import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { StatusPill } from "@/components/status-pill";

export default function CertificatePage({ params }: { params: { certNo: string } }) {
  const known = params.certNo.toUpperCase() === "ETM-2026-000001";
  return <div className="site-shell"><TopBar /><main className="center-page"><Link className="back-link" href="/verify"><ArrowLeft size={15} /> Verify another certificate</Link><div className="certificate-result"><div className="result-top"><div className="feature-icon"><ShieldCheck size={24} /></div>{known ? <StatusPill status="Valid" /> : <StatusPill status="Revoked">Not found</StatusPill>}</div><p className="eyebrow">Certificate verification</p><h1>{known ? "Certificate is valid" : "Certificate not found"}</h1><p>{known ? "This certificate record is active and its signature matches the issued content." : "We could not find an active certificate for this number. Check the number and try again."}</p><div className="certificate-number">{params.certNo.toUpperCase()}</div>{known && <dl className="certificate-details"><div><dt>Instrument category</dt><dd>Category A (placeholder)</dd></div><div><dt>Issued</dt><dd>28 Sep 2026</dd></div><div><dt>Valid until</dt><dd>28 Sep 2027</dd></div></dl>}<p className="form-note">Verification is limited to certificate status and instrument details. Owner identity is never exposed.</p></div></main></div>;
}
