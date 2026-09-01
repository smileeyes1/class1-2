import { appendEvent } from './state-journal.mjs';

const REPO = process.env.ZAYTOONA_PERSIST_REPO || 'smileeyes1/class1-2';
const BRANCH = process.env.ZAYTOONA_PERSIST_BRANCH || 'main';

export function persistenceConfig() {
  return { repository: REPO, branch: BRANCH, online: typeof fetch === 'function' };
}

export async function persistEvent(event) {
  const local = await appendEvent({ type: 'PERSIST_QUEUE', repository: REPO, branch: BRANCH, event });
  if (!process.env.ZAYTOONA_GITHUB_TOKEN) return { status: 'QUEUED_OFFLINE', local };
  // GitHub writes are intentionally delegated to CI using the journal as the durable queue.
  // This keeps credentials out of browser code and allows retry after network recovery.
  return { status: 'QUEUED_FOR_CI', local };
}
