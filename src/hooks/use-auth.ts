import { useCallback, useEffect, useState } from "react";
import { migrateLocalStorageKey } from "@/lib/storageKeys";
import { fetchSessionUser, loginAccount, logoutAccount, registerAccount } from "@/lib/account-api";
import { applyRemoteAccountState } from "@/lib/storage";

export type DemoUser = {
  id?: string;
  name: string;
  email?: string;
};

type LoginOptions = {
  email: string;
  password: string;
};

type RegisterOptions = {
  name: string;
  email: string;
  password: string;
};

const AUTH_USER_KEY = "streamxie-auth-user";
const LEGACY_AUTH_USER_KEY = "streamora-auth-user";
const listeners = new Set<() => void>();

const emitAuthChange = () => {
  listeners.forEach((listener) => listener());
};

const isBrowser = () => typeof window !== "undefined";

const readUser = (): DemoUser | null => {
  if (!isBrowser()) return null;

  try {
    migrateLocalStorageKey(AUTH_USER_KEY, LEGACY_AUTH_USER_KEY);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeUser = (user: DemoUser | null) => {
  if (!isBrowser()) return;

  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.removeItem(LEGACY_AUTH_USER_KEY);
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(LEGACY_AUTH_USER_KEY);
  }

  emitAuthChange();
};

export const useAuth = () => {
  const [user, setUser] = useState<DemoUser | null>(() => readUser());
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const syncUser = () => setUser(readUser());

    listeners.add(syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      listeners.delete(syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchSessionUser()
      .then(async (sessionUser) => {
        if (!mounted) return;
        writeUser(sessionUser);
        setUser(sessionUser);
        if (sessionUser) {
          await applyRemoteAccountState();
          setUser(readUser());
        }
      })
      .finally(() => {
        if (mounted) setIsPending(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (options: LoginOptions) => {
    setIsPending(true);

    try {
      const nextUser = await loginAccount(options);
      writeUser(nextUser);
      setUser(nextUser);
      await applyRemoteAccountState();
      setUser(readUser());
      return nextUser;
    } catch (error) {
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  const register = useCallback(async (options: RegisterOptions) => {
    setIsPending(true);
    try {
      const nextUser = await registerAccount(options);
      writeUser(nextUser);
      setUser(nextUser);
      await applyRemoteAccountState();
      setUser(readUser());
      return nextUser;
    } catch (error) {
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsPending(true);

    try {
      await logoutAccount();
      writeUser(null);
      setUser(null);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    user,
    isAnonymous: !user,
    isPending,
    login,
    register,
    logout,
  };
};
