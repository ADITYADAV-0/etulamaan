import {
  User,
  Instrument,
  Application,
  Inspection,
  Certificate,
  DeficiencyMemo,
  AuditLog
} from '../../../packages/shared-types/src';

export const mockUsers: User[] = [
  {
    id: 'usr-owner-1',
    name: 'Rajesh Kumar (Trader / Owner)',
    email: 'rajesh.traders@example.com',
    phone: '+919876543210',
    role: 'Owner',
    jurisdiction: 'District 1 - Central Zone',
    kycStatus: 'verified',
    aadhaarHash: '8f9a2b1c4e5d6a7b8c9d0e1f',
  },
  {
    id: 'usr-lmo-1',
    name: 'Inspector V. Sharma (LMO)',
    email: 'v.sharma@lm.gov.in',
    phone: '+919811223344',
    role: 'LMO',
    jurisdiction: 'District 1 - Central Zone',
    kycStatus: 'verified',
    twoFactorEnabled: true,
  }
];

export const mockInstruments: Instrument[] = [
  {
    id: 'inst-101',
    ownerId: 'usr-owner-1',
    category: 'Non-Automatic Weighing Instrument',
    capacity: '50 kg (Class III, e=10g)',
    manufacturer: 'Avery India Ltd',
    serialNo: 'AV-2024-8891',
    modelNo: 'AV-50K',
    installationAddress: 'Shop No 14, Main Market, Sector 12',
    jurisdiction: 'District 1 - Central Zone',
    lastVerifiedDate: '2025-09-15',
    nextDueDate: '2027-09-15',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'inst-102',
    ownerId: 'usr-owner-1',
    category: 'Fuel Dispenser / Flow Meter',
    capacity: '50 L/min',
    manufacturer: 'Gilbarco Veeder-Root',
    serialNo: 'FD-9942-X',
    modelNo: 'G-Flow-200',
    installationAddress: 'HP Fuel Station, Highway 44',
    jurisdiction: 'District 1 - Central Zone',
    lastVerifiedDate: '2025-03-20',
    nextDueDate: '2027-03-20',
    createdAt: '2024-03-15T11:30:00Z',
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-301',
    instrumentId: 'inst-101',
    ownerId: 'usr-owner-1',
    type: 're-verification',
    status: 'Scheduled',
    assignedOfficerId: 'usr-lmo-1',
    assignedOfficerName: 'Inspector V. Sharma (LMO)',
    scheduledDate: '2026-09-20',
    feeAmount: 450,
    paymentStatus: 'completed',
    documentUrls: ['https://etulamaan.gov.in/docs/inst-101-invoice.pdf'],
    photoUrls: ['https://etulamaan.gov.in/photos/inst-101-front.jpg'],
    createdAt: '2026-09-15T08:30:00Z',
    updatedAt: '2026-09-16T10:00:00Z',
  }
];

export const mockInspectionTasks: Inspection[] = [
  {
    id: 'task-501',
    applicationId: 'app-301',
    officerId: 'usr-lmo-1',
    officerName: 'Inspector V. Sharma (LMO)',
    checklist: [
      { id: 'chk-1', title: 'Physical Stamping & Seal Verification', description: 'Check lead seal integrity.', passed: true },
      { id: 'chk-2', title: 'Zero Load & Level Indicator Check', description: 'Ensure scale returns to exact zero.', passed: true },
      { id: 'chk-3', title: 'Maximum Capacity Accuracy Test', description: 'Apply standard test weights up to 50kg.', passed: true },
      { id: 'chk-4', title: 'Repeatability & Eccentricity Test', description: 'Test corner loads.', passed: true }
    ],
    readings: [
      { parameter: 'Zero Load Error', standardValue: '0.000 kg', observedValue: '0.000 kg', tolerance: '±0.005 kg', passed: true },
      { parameter: 'Half Load Error (25kg)', standardValue: '25.000 kg', observedValue: '25.002 kg', tolerance: '±0.010 kg', passed: true },
      { parameter: 'Full Load Error (50kg)', standardValue: '50.000 kg', observedValue: '50.004 kg', tolerance: '±0.010 kg', passed: true }
    ],
    evidenceUrls: ['https://etulamaan.gov.in/evidence/photo-501-scale.jpg'],
    result: 'pass',
    notes: 'Instrument passes statutory accuracy requirements under Legal Metrology Rules 2011.',
    geo: { latitude: 28.6139, longitude: 77.2090, address: 'Sector 12, Market Area' },
    timestamp: '2026-09-19T09:30:00Z'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-8001',
    applicationId: 'app-300',
    instrumentId: 'inst-101',
    instrumentCategory: 'Non-Automatic Weighing Instrument',
    serialNo: 'AV-2024-8891',
    ownerName: 'Rajesh Kumar Traders',
    qrPayload: {
      certificateId: 'cert-8001',
      verificationUrl: 'https://etulamaan.gov.in/verify/cert-8001',
      signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    signature: 'NIC-eSign-RSA2048-VALID-0x89A3F1',
    issuedAt: '2025-09-15T11:00:00Z',
    validUntil: '2027-09-15T23:59:59Z',
    status: 'valid'
  }
];

export const mockDeficiencyMemos: DeficiencyMemo[] = [];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'usr-owner-1',
    actorRole: 'Owner',
    action: 'SUBMIT_APPLICATION',
    entity: 'Application',
    entityId: 'app-301',
    timestamp: '2026-09-15T08:30:00Z',
    metadata: { feeAmount: 450 }
  }
];
