import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  mockUsers,
  mockInstruments,
  mockApplications,
  mockInspectionTasks,
  mockCertificates,
  mockDeficiencyMemos,
  mockAuditLogs
} from './mockData';
import {
  Inspection,
  Certificate,
  DeficiencyMemo,
  PublicVerificationResponse,
  AuditLog,
  Application
} from '../../../packages/shared-types/src';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'eTulaMaan Mock API Service', timestamp: new Date().toISOString() });
});

// Helper to record AuditLog
function recordAudit(actorId: string, actorRole: 'Owner' | 'LMO' | 'Public', action: string, entity: string, entityId: string, metadata?: any) {
  const audit: AuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId,
    actorRole,
    action,
    entity,
    entityId,
    timestamp: new Date().toISOString(),
    metadata
  };
  mockAuditLogs.push(audit);
  return audit;
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------
app.post('/v1/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const user = mockUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase() || u.role === role);

  if (!user) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials or role' } });
  }

  if (user.role === 'LMO') {
    return res.json({
      require2FA: true,
      userId: user.id,
      message: '2FA code sent via SMS/GovAuth'
    });
  }

  recordAudit(user.id, user.role, 'USER_LOGIN', 'User', user.id);
  res.json({
    token: `jwt-mock-token-${user.id}`,
    user
  });
});

app.post('/v1/auth/verify-2fa', (req: Request, res: Response) => {
  const { userId, code } = req.body;
  const user = mockUsers.find(u => u.id === userId);

  if (!user || code !== '123456') {
    return res.status(400).json({ error: { code: 'INVALID_2FA', message: 'Invalid 2FA verification code' } });
  }

  recordAudit(user.id, user.role, 'VERIFY_2FA_SUCCESS', 'User', user.id);
  res.json({
    token: `jwt-mock-token-${user.id}`,
    user
  });
});

app.post('/v1/auth/register-owner', (req: Request, res: Response) => {
  const { name, email, phone, jurisdiction } = req.body;
  const newUser = {
    id: `usr-owner-${Date.now()}`,
    name,
    email,
    phone,
    role: 'Owner' as const,
    jurisdiction: jurisdiction || 'District 1 - Central Zone',
    kycStatus: 'pending' as const
  };
  mockUsers.push(newUser);
  recordAudit(newUser.id, 'Owner', 'REGISTER_OWNER', 'User', newUser.id);
  res.status(201).json({ user: newUser, message: 'Registration successful. Please complete e-KYC.' });
});

app.post('/v1/auth/e-kyc', (req: Request, res: Response) => {
  const { userId, aadhaarNo } = req.body;
  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User record not found' } });
  }

  user.kycStatus = 'verified';
  user.aadhaarHash = `hash-${aadhaarNo.slice(-4)}`;
  recordAudit(user.id, user.role, 'EKYC_VERIFIED', 'User', user.id);
  res.json({ user, message: 'e-KYC verification successful via DigiLocker / Aadhaar gateway.' });
});

// ----------------------------------------------------
// INSTRUMENT & APPLICATION ENDPOINTS
// ----------------------------------------------------
app.get('/v1/instruments', (req: Request, res: Response) => {
  const { ownerId } = req.query;
  let list = mockInstruments;
  if (ownerId) {
    list = list.filter(i => i.ownerId === ownerId);
  }
  res.json({ instruments: list });
});

app.post('/v1/instruments', (req: Request, res: Response) => {
  const { ownerId, category, capacity, manufacturer, serialNo, installationAddress, jurisdiction } = req.body;
  const inst = {
    id: `inst-${Date.now()}`,
    ownerId: ownerId || 'usr-owner-1',
    category,
    capacity,
    manufacturer,
    serialNo,
    installationAddress,
    jurisdiction: jurisdiction || 'District 1 - Central Zone',
    createdAt: new Date().toISOString()
  };
  mockInstruments.push(inst);
  recordAudit(inst.ownerId, 'Owner', 'CREATE_INSTRUMENT', 'Instrument', inst.id);
  res.status(201).json({ instrument: inst });
});

app.get('/v1/applications', (req: Request, res: Response) => {
  const { ownerId, officerId } = req.query;
  let list = mockApplications;
  if (ownerId) {
    list = list.filter(a => a.ownerId === ownerId);
  }
  if (officerId) {
    list = list.filter(a => a.assignedOfficerId === officerId);
  }
  res.json({ applications: list });
});

app.post('/v1/applications', (req: Request, res: Response) => {
  const { instrumentId, ownerId, type, feeAmount, documentUrls, photoUrls } = req.body;
  const appItem: Application = {
    id: `app-${Date.now()}`,
    instrumentId,
    ownerId: ownerId || 'usr-owner-1',
    type: type || 're-verification',
    status: 'Submitted',
    assignedOfficerId: 'usr-lmo-1',
    assignedOfficerName: 'Inspector V. Sharma (LMO)',
    feeAmount: feeAmount || 500,
    paymentStatus: 'completed',
    documentUrls: documentUrls || [],
    photoUrls: photoUrls || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockApplications.push(appItem);

  const newTask: Inspection = {
    id: `task-${Date.now()}`,
    applicationId: appItem.id,
    officerId: 'usr-lmo-1',
    officerName: 'Inspector V. Sharma (LMO)',
    checklist: [
      { id: 'c1', title: 'Stamping & Lead Seal Check', description: 'Inspect previous mark and seal integrity.', passed: true },
      { id: 'c2', title: 'Zero Point & Level Test', description: 'Confirm zero point stability under no load.', passed: true },
      { id: 'c3', title: 'Standard Weight Load Test', description: 'Test accuracy against statutory standard weights.', passed: true }
    ],
    readings: [
      { parameter: 'Zero Load Error', standardValue: '0.000 kg', observedValue: '0.000 kg', tolerance: '±0.005 kg', passed: true },
      { parameter: 'Full Load Test', standardValue: '25.000 kg', observedValue: '25.001 kg', tolerance: '±0.010 kg', passed: true }
    ],
    evidenceUrls: [],
    result: 'pass',
    notes: 'Pending field inspection.',
    geo: { latitude: 28.6139, longitude: 77.2090 },
    timestamp: new Date().toISOString()
  };
  mockInspectionTasks.push(newTask);

  recordAudit(appItem.ownerId, 'Owner', 'SUBMIT_APPLICATION', 'Application', appItem.id);
  res.status(201).json({ application: appItem, task: newTask });
});

// ----------------------------------------------------
// PAYMENT MOCK ENDPOINTS
// ----------------------------------------------------
app.post('/v1/payments/initiate', (req: Request, res: Response) => {
  const { applicationId, amount } = req.body;
  res.json({
    transactionId: `txn-${Date.now()}`,
    applicationId,
    amount,
    currency: 'INR',
    gatewayUrl: 'https://etulamaan.gov.in/payment-gateway-stub',
    status: 'pending'
  });
});

app.post('/v1/payments/verify', (req: Request, res: Response) => {
  const { transactionId, applicationId } = req.body;
  const appItem = mockApplications.find(a => a.id === applicationId);
  if (appItem) {
    appItem.paymentStatus = 'completed';
  }
  res.json({
    transactionId,
    status: 'completed',
    receiptNo: `RCPT-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// LMO INSPECTION & ADR-005 SYNC ENDPOINTS
// ----------------------------------------------------
app.get('/v1/inspections/tasks', (req: Request, res: Response) => {
  const { officerId } = req.query;
  let tasks = mockInspectionTasks;
  if (officerId) {
    tasks = tasks.filter(t => t.officerId === officerId);
  }
  res.json({ tasks });
});

// ADR-005 IDEMPOTENT UPSERT SYNC BY TASK ID
app.post('/v1/inspections/sync', (req: Request, res: Response) => {
  const inspectionPayload: Inspection = req.body;
  const taskId = inspectionPayload.id;

  if (!taskId) {
    return res.status(400).json({ error: { code: 'MISSING_TASK_ID', message: 'Task ID is required for sync per ADR-005.' } });
  }

  const existingTaskIndex = mockInspectionTasks.findIndex(t => t.id === taskId);
  inspectionPayload.syncedAt = new Date().toISOString();

  if (existingTaskIndex >= 0) {
    mockInspectionTasks[existingTaskIndex] = inspectionPayload;
  } else {
    mockInspectionTasks.push(inspectionPayload);
  }

  const appItem = mockApplications.find(a => a.id === inspectionPayload.applicationId);
  if (appItem) {
    appItem.status = 'Inspected';

    if (inspectionPayload.result === 'pass') {
      appItem.status = 'Certified';

      const cert: Certificate = {
        id: `cert-${Date.now()}`,
        applicationId: appItem.id,
        instrumentId: appItem.instrumentId,
        instrumentCategory: 'Non-Automatic Weighing Instrument',
        serialNo: `SR-${appItem.instrumentId}`,
        ownerName: 'Rajesh Kumar Traders',
        qrPayload: {
          certificateId: `cert-${Date.now()}`,
          verificationUrl: `https://etulamaan.gov.in/verify/cert-${Date.now()}`,
          signatureHash: `hash-${Date.now()}`
        },
        signature: `NIC-eSign-RSA2048-VALID-${Date.now()}`,
        issuedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'valid'
      };
      mockCertificates.push(cert);
    } else {
      appItem.status = 'Rejected';

      const memo: DeficiencyMemo = {
        id: `memo-${Date.now()}`,
        applicationId: appItem.id,
        instrumentId: appItem.instrumentId,
        officerId: inspectionPayload.officerId,
        notes: inspectionPayload.notes || 'Failed accuracy test.',
        deficiencies: inspectionPayload.checklist.filter(c => !c.passed).map(c => c.title),
        issuedAt: new Date().toISOString()
      };
      mockDeficiencyMemos.push(memo);
    }
  }

  recordAudit(
    inspectionPayload.officerId,
    'LMO',
    'SYNC_INSPECTION_RESULT',
    'Inspection',
    taskId,
    { result: inspectionPayload.result, appStatus: appItem?.status }
  );

  res.json({
    status: 'synced',
    taskId,
    result: inspectionPayload.result,
    syncedAt: inspectionPayload.syncedAt,
    applicationStatus: appItem?.status || 'Inspected'
  });
});

// ----------------------------------------------------
// CERTIFICATE & PUBLIC VERIFICATION ENDPOINTS
// ----------------------------------------------------
app.get('/v1/certificates/:id', (req: Request, res: Response) => {
  const cert = mockCertificates.find(c => c.id === req.params.id || c.applicationId === req.params.id);
  if (!cert) {
    return res.status(404).json({ error: { code: 'CERTIFICATE_NOT_FOUND', message: 'Certificate not found.' } });
  }
  res.json({ certificate: cert });
});

// PUBLIC VERIFICATION ENDPOINT (No owner PII exposed per Architecture.md §5)
app.get('/v1/public/certificates/:certId/verify', (req: Request, res: Response) => {
  const certId = req.params.certId;
  const cert = mockCertificates.find(c => c.id === certId || c.qrPayload.certificateId === certId);

  if (!cert) {
    const notFoundResponse: PublicVerificationResponse = {
      certificateId: certId,
      status: 'revoked',
      instrumentCategory: 'Non-Automatic Weighing Instrument',
      serialNoMasked: 'XXXX-XXXX',
      jurisdiction: 'Government of India - Legal Metrology Dept',
      issuedAt: 'N/A',
      validUntil: 'N/A',
      isValid: false
    };
    return res.status(404).json({ verification: notFoundResponse });
  }

  const isExpired = new Date(cert.validUntil) < new Date();
  const currentStatus = isExpired ? 'expired' : cert.status;

  const publicResponse: PublicVerificationResponse = {
    certificateId: cert.id,
    status: currentStatus,
    instrumentCategory: cert.instrumentCategory,
    serialNoMasked: cert.serialNo ? `${cert.serialNo.slice(0, 3)}****${cert.serialNo.slice(-3)}` : 'XXXX-XXXX',
    jurisdiction: 'District 1 - Legal Metrology Dept',
    issuedAt: cert.issuedAt,
    validUntil: cert.validUntil,
    isValid: currentStatus === 'valid'
  };

  recordAudit('PUBLIC_ANONYMOUS', 'Public', 'PUBLIC_VERIFY_CERTIFICATE', 'Certificate', cert.id);
  res.json({ verification: publicResponse });
});

app.get('/v1/audit-logs', (_req: Request, res: Response) => {
  res.json({ auditLogs: mockAuditLogs });
});

export default app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[eTulaMaan Mock API] Server running on http://localhost:${PORT}`);
  });
}
