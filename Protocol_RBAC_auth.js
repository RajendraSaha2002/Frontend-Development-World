/**
 * auth.js — PROTOCOL RBAC
 * Manages session token storage and all HTTP communication with
 * the Python server. Loaded before router.js on every page.
 *
 * Token is stored in sessionStorage (cleared on tab close).
 * Every request includes the token in X-Auth-Token header.
 */

'use strict';

const Auth = (() => {

  const TOKEN_KEY = 'protocol_token';
  const USER_KEY  = 'protocol_user';

  /* ── Token ─────────────────────────────────────────────────────
     We deliberately use sessionStorage so the token is never
     written to disk (unlike localStorage) and is wiped on tab close.
  ─────────────────────────────────────────────────────────────── */
  function getToken()  { return sessionStorage.getItem(TOKEN_KEY) || null; }
  function _setToken(t){ sessionStorage.setItem(TOKEN_KEY, t); }
  function _clearAll() { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); }

  /* ── Cached user object ─────────────────────────────────────── */
  function getUser()  {
    const raw = sessionStorage.getItem(USER_KEY);
    try   { return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }
  function _setUser(u){ sessionStorage.setItem(USER_KEY, JSON.stringify(u)); }

  /* ── Core HTTP wrapper ──────────────────────────────────────────
     All fetch calls go through here.
     Returns { ok:bool, status:int, data:object }
  ─────────────────────────────────────────────────────────────── */
  async function _call(method, endpoint, body = null) {
    const opts = {
      method,
      headers: {
        'Content-Type' : 'application/json',
        'X-Auth-Token' : getToken() || '',
      },
    };
    if (body !== null) opts.body = JSON.stringify(body);

    try {
      const res  = await fetch(endpoint, opts);
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.error('[Auth] Network error:', err);
      return { ok: false, status: 0, data: { error: 'Network error' } };
    }
  }

  /* ── Public API call helpers ────────────────────────────────── */
  async function apiGet(endpoint)        { return _call('GET',  endpoint); }
  async function apiPost(endpoint, body) { return _call('POST', endpoint, body); }

  /* ── Login ──────────────────────────────────────────────────────
     POST /api/login → stores token + user info on success.
  ─────────────────────────────────────────────────────────────── */
  async function login(username, password) {
    const result = await apiPost('/api/login', { username, password });
    if (result.ok && result.data.token) {
      _setToken(result.data.token);
      _setUser(result.data.user);
    }
    return result;
  }

  /* ── Logout ─────────────────────────────────────────────────────
     POST /api/logout → server destroys session row, then we clear
     local storage and redirect to login.
  ─────────────────────────────────────────────────────────────── */
  async function logout() {
    try { await apiPost('/api/logout'); } catch (_) { /* always clear */ }
    _clearAll();
    window.location.href = '/';
  }

  /* ── isLoggedIn ─────────────────────────────────────────────── */
  function isLoggedIn() { return !!getToken(); }

  /* ── Public surface ─────────────────────────────────────────── */
  return {
    getToken,
    getUser,
    isLoggedIn,
    login,
    logout,
    apiGet,
    apiPost,
  };

})();

// Expose globally
window.Auth = Auth;