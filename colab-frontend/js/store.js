/**
 * store.js — Reactive State Management (pub/sub)
 * Lightweight alternative to Zustand/Redux. ~50 lines.
 */

/**
 * Create a reactive store with pub/sub.
 * @param {Object} initialState
 * @returns {Object} store
 */
export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Map();
  let pendingFlush = false;
  const pendingKeys = new Set();

  function flush() {
    pendingFlush = false;
    for (const key of pendingKeys) {
      if (listeners.has(key)) {
        const value = state[key];
        listeners.get(key).forEach((fn) => fn(value, state));
      }
    }
    pendingKeys.clear();
  }

  return {
    /**
     * Get state value(s).
     * @param {string} [key] - Optional key. Returns full state if omitted.
     */
    get(key) {
      return key ? state[key] : { ...state };
    },

    /**
     * Update state and notify listeners.
     * Uses queueMicrotask for batching multiple set() calls.
     * @param {Object} updates
     */
    set(updates) {
      const prev = { ...state };
      state = { ...state, ...updates };

      for (const key of Object.keys(updates)) {
        if (prev[key] !== state[key]) {
          pendingKeys.add(key);
        }
      }

      if (!pendingFlush && pendingKeys.size > 0) {
        pendingFlush = true;
        queueMicrotask(flush);
      }
    },

    /**
     * Subscribe to changes on a specific key.
     * @param {string} key
     * @param {function(any, Object): void} fn - Callback (value, fullState)
     * @returns {function(): void} unsubscribe
     */
    on(key, fn) {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(fn);
      return () => listeners.get(key).delete(fn);
    },

    /**
     * Reset state to initial values.
     */
    reset() {
      const updates = {};
      for (const key of Object.keys(initialState)) {
        updates[key] = initialState[key];
      }
      this.set(updates);
    },
  };
}

// ── App Store (global singleton) ──
/* ┌─────────────────────────────────────────────────┐
   │  DEV ONLY — Mock user for local development.    │
   │  In production, populated via SAML auth flow    │
   │  at /api/auth/session.                          │
   └─────────────────────────────────────────────────┘ */
export const appStore = createStore({
  user: {
    id: 'tech-001',
    name: 'Carlos Mendoza',
    role: 'technician', // technician | manager | admin
    bu: 'BU-14',
    avatarUrl: null,
    availableHours: 12,
    status: 'free', // free | partial | busy
  },
  filters: {
    category: 'all',
    urgency: 'all',
    bu: 'all',
  },
  searchQuery: '',
  sideNavCollapsed: false,
  notifications: [],
  unreadCount: 3,
  modalOpen: null, // null or modal name string
});
