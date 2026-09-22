/**
 * eTulaMaan Shared TypeScript Types & API Contracts
 * Governed by Legal Metrology Act, 2009 & Rules, 2011
 */

export type UserRole = 'Owner' | 'LMO' | 'Public';

export type KycStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  jurisdiction?: string;
  kycStatus: KycStatus;
  aadhaarHash?: string;
  twoFactorEnabled?: boolean;
}

export type InstrumentCategory =
  | 'Non-Automatic Weighing Instrument'
  | 'Automatic Weighing Instrument'
  | 'Fuel Dispenser / Flow Meter'
  | 'Linear Measuring Instrument (Tape/Scale)'
  | 'Capacity Measure (Liters/Cans)'
  | 'Storage Tank / Weighbridge';

export interface Instrument {
  id: string;
  ownerId: string;
  category: InstrumentCategory;
  capacity: string;
  manufacturer: string;
  serialNo: string;
  modelNo?: string;
  installationAddress: string;
  jurisdiction: string;
  lastVerifiedDate?: string;
  nextDueDate?: string;
  createdAt: string;
}

export type ApplicationType = 'new' | 're-verification';

export type ApplicationStatus =
  | 'Submitted'
  | 'Scheduled'
  | 'Inspected'
  | 'Certified'
  | 'Rejected';

export interface Application {
  id: string;
  instrumentId: string;
  ownerId: string;
  type: ApplicationType;
  status: ApplicationStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  scheduledDate?: string;
  feeAmount: number;
  paymentStatus: PaymentStatus;
  documentUrls: string[];
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentTransaction {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  paymentGatewayTxnId?: string;
  status: PaymentStatus;
  timestamp: string;
}

export type InspectionResult = 'pass' | 'fail';

export interface ChecklistCategoryItem {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  notes?: string;
}

export interface InspectionReading {
  parameter: string;
  standardValue: string;
  observedValue: string;
  tolerance: string;
  passed: boolean;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface Inspection {
  id: string; // Server-issued task ID (ADR-005)
  applicationId: string;
  officerId: string;
  officerName: string;
  checklist: ChecklistCategoryItem[];
  readings: InspectionReading[];
  evidenceUrls: string[];
  result: InspectionResult;
  notes?: string;
  geo: GeoLocation;
  timestamp: string;
  syncedAt?: string;
}

export type CertificateStatus = 'valid' | 'expired' | 'revoked';

export interface QrPayload {
  certificateId: string;
  verificationUrl: string;
  signatureHash: string;
}

export interface Certificate {
  id: string;
  applicationId: string;
  instrumentId: string;
  instrumentCategory: InstrumentCategory;
  serialNo: string;
  ownerName: string;
  qrPayload: QrPayload;
  signature: string; // PKI digital signature (NIC e-Sign / CA)
  issuedAt: string;
  validUntil: string;
  status: CertificateStatus;
  verificationCount?: number;
}

export interface DeficiencyMemo {
  id: string;
  applicationId: string;
  instrumentId: string;
  officerId: string;
  notes: string;
  deficiencies: string[];
  issuedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Public verification response (NO OWNER PII per Architecture.md §5 & Design.md §7)
export interface PublicVerificationResponse {
  certificateId: string;
  status: CertificateStatus;
  instrumentCategory: InstrumentCategory;
  serialNoMasked: string;
  jurisdiction: string;
  issuedAt: string;
  validUntil: string;
  isValid: boolean;
}

// ADR-005 Mobile Offline Sync Queue Item
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string; // Internal queue ID
  taskId: string; // Server-issued inspection task ID (ADR-005)
  inspectionData: Inspection;
  status: SyncStatus;
  retryCount: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
}
