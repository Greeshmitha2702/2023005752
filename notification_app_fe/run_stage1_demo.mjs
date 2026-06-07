import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { getTopNotificationsSorted, getTopNotificationsStream } = await import('./src/utils/priorityLogic.js');

async function loadSample() {
  // optional sample - if notifications.json exists, use it
  try {
    const p = path.join(__dirname, 'sample_notifications.json');
    const raw = await readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [
      { ID: '1', Type: 'Event', Timestamp: '2026-04-22T17:51:30Z', Message: 'Guest lecture' },
      { ID: '2', Type: 'Placement', Timestamp: '2026-04-22T17:51:18Z', Message: 'Company drive' },
      { ID: '3', Type: 'Result', Timestamp: '2026-04-23T09:10:00Z', Message: 'Exam results out' },
      { ID: '4', Type: 'Event', Timestamp: '2026-04-24T10:00:00Z', Message: 'Hackathon' }
    ];
  }
}

async function run() {
  const items = await loadSample();
  console.log('API Response (sample):');
  console.log(JSON.stringify(items, null, 2));

  const topSorted = getTopNotificationsSorted(items, 3);
  console.log('\nTop 3 (sorted approach):');
  console.log(JSON.stringify(topSorted, null, 2));

  const topStream = getTopNotificationsStream(items, 3);
  console.log('\nTop 3 (stream approach):');
  console.log(JSON.stringify(topStream, null, 2));
}

void run();
