import { syncEngine } from '../services/syncEngine';
import { Inspection } from '@etulamaan/shared-types';

describe('ADR-005 Offline Sync Engine Unit Tests', () => {
  const sampleInspection: Inspection = {
    id: 'task-test-101',
    applicationId: 'app-test-301',
    officerId: 'usr-lmo-1',
    officerName: 'Inspector V. Sharma',
    checklist: [
      { id: 'c1', title: 'Seal Check', description: 'Passed', passed: true }
    ],
    readings: [
      { parameter: 'Zero Load Error', standardValue: '0.000 kg', observedValue: '0.000 kg', tolerance: '±0.005 kg', passed: true }
    ],
    evidenceUrls: ['https://etulamaan.gov.in/test.jpg'],
    result: 'pass',
    notes: 'Field test passed',
    geo: { latitude: 28.6139, longitude: 77.2090 },
    timestamp: new Date().toISOString()
  };

  it('queues inspection locally when offline without throwing', async () => {
    syncEngine.setOnlineStatus(false);
    expect(syncEngine.getOnlineStatus()).toBe(false);

    const queuedItem = await syncEngine.queueInspection(sampleInspection);
    expect(queuedItem.taskId).toBe('task-test-101');
    expect(queuedItem.status).toBe('pending');

    const queue = syncEngine.getQueue();
    expect(queue.some(q => q.taskId === 'task-test-101')).toBe(true);
  });

  it('ADR-005 Idempotency: repeated queueing of same taskId upserts instead of creating duplicates', async () => {
    syncEngine.setOnlineStatus(false);

    await syncEngine.queueInspection(sampleInspection);

    const updatedInspection = { ...sampleInspection, notes: 'Updated notes on repeat' };
    await syncEngine.queueInspection(updatedInspection);

    const queue = syncEngine.getQueue();
    const matches = queue.filter(q => q.taskId === 'task-test-101');
    expect(matches.length).toBe(1);
    expect(matches[0].inspectionData.notes).toBe('Updated notes on repeat');
  });
});
