import request from 'supertest';
import app from '../server';

describe('eTulaMaan Mock API Server Tests', () => {
  it('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /v1/auth/login requires 2FA for LMO role', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'v.sharma@lm.gov.in', role: 'LMO' });

    expect(res.status).toBe(200);
    expect(res.body.require2FA).toBe(true);
  });

  it('POST /v1/auth/verify-2fa validates LMO 2FA code', async () => {
    const res = await request(app)
      .post('/v1/auth/verify-2fa')
      .send({ userId: 'usr-lmo-1', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('LMO');
  });

  it('ADR-005 POST /v1/inspections/sync idempotently updates task and issues certificate on pass', async () => {
    const syncPayload = {
      id: 'task-501',
      applicationId: 'app-301',
      officerId: 'usr-lmo-1',
      officerName: 'Inspector V. Sharma (LMO)',
      checklist: [
        { id: 'c1', title: 'Seal Check', description: 'Passed', passed: true }
      ],
      readings: [],
      evidenceUrls: ['https://etulamaan.gov.in/photo1.jpg'],
      result: 'pass',
      notes: 'All good',
      geo: { latitude: 28.6, longitude: 77.2 },
      timestamp: new Date().toISOString()
    };

    const res = await request(app)
      .post('/v1/inspections/sync')
      .set('Authorization', 'Bearer jwt-mock-token-usr-lmo-1')
      .send(syncPayload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('synced');
    expect(res.body.applicationStatus).toBe('Certified');

    const firstCertificate = await request(app)
      .get('/v1/certificates/app-301')
      .set('Authorization', 'Bearer jwt-mock-token-usr-owner-1');
    expect(firstCertificate.status).toBe(200);
    expect(firstCertificate.body.certificate.id).toBe('cert-app-301');

    const repeat = await request(app)
      .post('/v1/inspections/sync')
      .set('Authorization', 'Bearer jwt-mock-token-usr-lmo-1')
      .send(syncPayload);
    expect(repeat.status).toBe(200);
    expect(repeat.body.certificateId).toBe('cert-app-301');
  });

  it('rejects protected requests without a valid access token', async () => {
    const res = await request(app).get('/v1/instruments');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /v1/public/certificates/:certId/verify returns public verification with NO OWNER PII', async () => {
    const res = await request(app).get('/v1/public/certificates/cert-8001/verify');
    expect(res.status).toBe(200);
    expect(res.body.verification).toBeDefined();
    expect(res.body.verification.isValid).toBe(true);
    // Explicitly check that owner name, email, phone, and address are NOT present in the public response
    expect(res.body.verification.ownerName).toBeUndefined();
    expect(res.body.verification.ownerEmail).toBeUndefined();
    expect(res.body.verification.ownerPhone).toBeUndefined();
    expect(res.body.verification.address).toBeUndefined();
  });
});
