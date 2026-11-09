// Demo guest helpers. The real state (is this a guest, how many analyses are
// left) comes from GET /users/me. The one thing kept in the browser is a
// sessionStorage flag, so that when a guest's session ends we can say "Demo
// session ended" instead of a plain login redirect. sessionStorage is wiped
// when the tab closes, matching the backend's session cookie.

const FLAG = 'demo';

export const markDemoSession = () => {
  if (typeof window !== 'undefined') sessionStorage.setItem(FLAG, '1');
};

export const clearDemoSession = () => {
  if (typeof window !== 'undefined') sessionStorage.removeItem(FLAG);
};

export const isDemoSession = () =>
  typeof window !== 'undefined' && sessionStorage.getItem(FLAG) === '1';

// Where to send someone whose session is gone
export const loginPath = () => (isDemoSession() ? '/login?demo=ended' : '/login');

// Machine-readable codes in the backend's `errors: [{ code }]`
export const DEMO_LIMIT_REACHED = 'DEMO_LIMIT_REACHED';
export const DEMO_CHAT_LIMIT_REACHED = 'DEMO_CHAT_LIMIT_REACHED';
