import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";

export type CertificatePayload = { certNo: string; instrumentId: string; category: string; issuedAt: string; validUntil: string; applicationId: string };
export function canonicalCertificateJson(payload: CertificatePayload) { return JSON.stringify(payload, Object.keys(payload).sort()); }
export function hashCertificate(payload: CertificatePayload) { return createHash("sha256").update(canonicalCertificateJson(payload)).digest("hex"); }
export function createLocalKeyPair() { return generateKeyPairSync("ed25519"); }
export function signCertificate(payload: CertificatePayload, privateKey: string) { const hash = hashCertificate(payload); return { hash, signature: sign(null, Buffer.from(hash), privateKey).toString("base64") }; }
export function verifyCertificate(payload: CertificatePayload, signature: string, publicKey: string) { const hash = hashCertificate(payload); return verify(null, Buffer.from(hash), publicKey, Buffer.from(signature, "base64")); }
export interface NicESignSigner { sign(payload: CertificatePayload): Promise<string>; verify(payload: CertificatePayload, signature: string): Promise<boolean>; }
