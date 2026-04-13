const TOKEN_KEY = "warehouse-command-token";
const USER_KEY = "warehouse-command-user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredSession(token: string, username: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  return localStorage.getItem(USER_KEY);
}
