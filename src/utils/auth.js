// src/utils/auth.js
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('databridge_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  try {
    return localStorage.getItem('databridge_token');
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken() && getStoredUser());
}

export function getUserId(user = getStoredUser()) {
  if (!user) return null;
  return user.id || user._id || user.userId || user.email || null;
}

export function requireLogin(returnTo) {
  const target = returnTo || window.location.pathname + window.location.search;
  const url = `/login?returnTo=${encodeURIComponent(target)}`;
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}