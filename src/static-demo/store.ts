import { createDefaultState, type CoopState } from '../data/defaultState';
import { isStaff } from '../lib/roles';

export type { CoopState };

// v4: staff names — Dan Segun / Ola Dayo / Tunde Bakare
// v5: member market — products, orders, order items + deposit wallet balances
const STORAGE_KEY = 'seedcoop-state-v5';
const SESSION_KEY = 'seedcoop-session-v5';

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
  if (!session) {
    return {
      user: null as any,
      member: null as any,
      portal: null as 'MEMBER' | 'ADMIN' | null,
      canSwitchToMember: false,
      canSwitchToAdmin: false,
    };
  }
  const user = state.users.find((u) => u.id === session.userId) || null;
  if (!user) {
    return {
      user: null,
      member: null,
      portal: null as 'MEMBER' | 'ADMIN' | null,
      canSwitchToMember: false,
      canSwitchToAdmin: false,
    };
  }
  // Staff are members first — always resolve linked member profile when present
  const member = state.members.find((m) => m.userId === user.id) || null;
  const canSwitchToMember = isStaff(user.role) && !!member;
  const canSwitchToAdmin = isStaff(user.role);
  return {
    user,
    member,
    portal: session.portal,
    canSwitchToMember,
    canSwitchToAdmin,
  };
}
