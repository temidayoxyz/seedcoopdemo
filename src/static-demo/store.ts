import { createDefaultState, type CoopState } from '../data/defaultState';

export type { CoopState };

const STORAGE_KEY = 'seedcoop-state-v2';
const SESSION_KEY = 'seedcoop-session-v2';

export type Session = { userId: string; portal: 'MEMBER' | 'ADMIN' };

export function loadState(): CoopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CoopState;
  } catch {
    /* fall through */
  }
  const seed = createDefaultState();
  saveState(seed);
  return seed;
}

export function saveState(state: CoopState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): CoopState {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  const seed = createDefaultState();
  saveState(seed);
  return seed;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAuth(state: CoopState) {
  const session = getSession();
  if (!session) return { user: null as any, member: null as any };
  const user = state.users.find((u) => u.id === session.userId) || null;
  if (!user) return { user: null, member: null };
  const member =
    user.role === 'MEMBER'
      ? state.members.find((m) => m.userId === user.id) || null
      : null;
  return { user, member };
}
