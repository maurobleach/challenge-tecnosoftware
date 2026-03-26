import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authService } from "~/modules/auth/auth.service";
import { getStoredToken, removeStoredToken, setStoredToken } from "~/utils/storage";

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setIsAuthReady(true);
  }, []);

  const login = async ({ email, password }: LoginInput) => {
    const nextToken = await authService.login(email, password);
    setStoredToken(nextToken);
    setToken(nextToken);
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
  };

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), isAuthReady, login, logout }),
    [token, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
