import { describe, expect, it } from "vitest";
import { createLocalKeyPair, hashCertificate, signCertificate, verifyCertificate } from "@/modules/certification/service";
import { requireRole } from "@/lib/rbac";

const payload = { certNo: "ETM-2026-000001", instrumentId: "instrument-1", category: "Category A (placeholder)", issuedAt: "2026-09-28", validUntil: "2027-09-28", applicationId: "application-1" };

describe("certificate integrity", () => {
  it("detects payload tampering", () => {
    const { privateKey, publicKey } = createLocalKeyPair();
    const signed = signCertificate(payload, privateKey.export({ type: "pkcs8", format: "pem" }).toString());
    expect(verifyCertificate(payload, signed.signature, publicKey.export({ type: "spki", format: "pem" }).toString())).toBe(true);
    expect(verifyCertificate({ ...payload, category: "tampered" }, signed.signature, publicKey.export({ type: "spki", format: "pem" }).toString())).toBe(false);
    expect(hashCertificate(payload)).toHaveLength(64);
  });
});

describe("RBAC guard", () => {
  it("accepts an allowed role and rejects an absent role", () => {
    expect(requireRole("ADMIN", ["ADMIN"])).toBe("ADMIN");
    expect(() => requireRole(undefined, ["OWNER"])).toThrow("FORBIDDEN");
  });
});
