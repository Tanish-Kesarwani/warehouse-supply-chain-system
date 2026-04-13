import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredSession, getStoredToken, getStoredUser, setStoredSession } from "../../lib/storage";

type AuthContextValue = {
  isAuthenticated: boolean;
  username: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("Operator");

  useEffect(() => {
    setToken(getStoredToken());
    setUsername(getStoredUser() ?? "Operator");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      username,
      async login(nextUsername: string, password: string) {
        if (!nextUsername.trim() || !password.trim()) {
          throw new Error("Username and password are required");
        }
        const fakeToken = `mock-jwt-${btoa(`${nextUsername}:${Date.now()}`)}`;
        setStoredSession(fakeToken, nextUsername.trim());
        setToken(fakeToken);
        setUsername(nextUsername.trim());
      },
      logout() {
        clearStoredSession();
        setToken(null);
        setUsername("Operator");
      }
    }),
    [token, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
