import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { apiClient, ApiResponseError } from "../api/client";
import type {
  LoginRequest,
  PasswordResetConfirmRequest,
  RegisterRequest,
  UserDto,
} from "../api/contracts";

export type AuthStatus = "loading" | "anonymous" | "authenticated" | "error";

type AuthApi = typeof apiClient.auth;

type AuthContextValue = {
  status: AuthStatus;
  user: UserDto | null;
  error: string | null;
  login(input: LoginRequest): Promise<void>;
  register(input: RegisterRequest): Promise<UserDto>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  confirmPasswordReset(input: PasswordResetConfirmRequest): Promise<void>;
  refresh(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  authApi = apiClient.auth,
}: PropsWithChildren<{ authApi?: AuthApi }>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const current = await authApi.currentUser();
      setUser(current);
      setStatus("authenticated");
    } catch (cause) {
      if (cause instanceof ApiResponseError && cause.status === 401) {
        setUser(null);
        setStatus("anonymous");
        return;
      }
      setUser(null);
      setStatus("error");
      setError(
        cause instanceof Error ? cause.message : "Authentication unavailable",
      );
    }
  }, [authApi]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      async login(input) {
        const session = await authApi.login(input);
        setUser(session.user);
        setStatus("authenticated");
        setError(null);
      },
      async register(input) {
        return authApi.register(input);
      },
      async logout() {
        await authApi.logout();
        setUser(null);
        setStatus("anonymous");
        setError(null);
      },
      async requestPasswordReset(email) {
        await authApi.requestPasswordReset(email);
      },
      async confirmPasswordReset(input) {
        await authApi.confirmPasswordReset(input);
        setUser(null);
        setStatus("anonymous");
        setError(null);
      },
      refresh,
    }),
    [authApi, error, refresh, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
