import type { ReactNode } from "react";

type Status = "Submitted" | "Scheduled" | "Inspected" | "Certified" | "Rejected" | "Valid" | "Expired" | "Revoked";

const styles: Record<Status, string> = {
  Submitted: "status-submitted",
  Scheduled: "status-scheduled",
  Inspected: "status-inspected",
  Certified: "status-certified",
  Rejected: "status-rejected",
  Valid: "status-certified",
  Expired: "status-inspected",
  Revoked: "status-rejected",
};

export function StatusPill({ status, children }: { status: Status; children?: ReactNode }) {
  return <span className={`status-pill ${styles[status]}`}>{children ?? status}</span>;
}
