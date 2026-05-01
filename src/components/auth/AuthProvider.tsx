"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { User } from "@/types/user";

type AuthContextValue = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  signInPlaceholder: () => void;
  registerPlaceholder: () => void;
  logoutPlaceholder: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const PLACEHOLDER_SESSION_KEY = "wicked.placeholderCustomerSession";
const PLACEHOLDER_SESSION_EVENT = "wicked-placeholder-auth-change";
let cachedSessionRaw: string | null = null;
let cachedSessionUser: User | null = null;

function createCustomerPlaceholder(name = "Preview Customer"): User {
  return {
    id: "preview-customer",
    name,
    email: "customer@wicked.local",
    phone: "+27 82 555 0140",
    createdAt: "2026-04-29T00:00:00.000Z",
    addresses: [
      {
        id: "addr-preview-1",
        label: "Default delivery",
        recipientName: name,
        phone: "+27 82 555 0140",
        line1: "18 Bree Street",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8001",
        country: "South Africa",
        isDefault: true,
      },
    ],
    preferences: {
      marketingEmails: true,
      orderSmsUpdates: true,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useSyncExternalStore(
    subscribeToPlaceholderSession,
    readPlaceholderSession,
    () => null,
  );

  const persistPlaceholderUser = useCallback((user: User) => {
    // TODO(auth): Replace this preview-only sessionStorage state with a real
    // auth provider, httpOnly session cookies, and backend-owned profile data.
    window.sessionStorage.setItem(
      PLACEHOLDER_SESSION_KEY,
      JSON.stringify(user),
    );
    window.dispatchEvent(new Event(PLACEHOLDER_SESSION_EVENT));
  }, []);

  const signInPlaceholder = useCallback(() => {
    persistPlaceholderUser(createCustomerPlaceholder());
  }, [persistPlaceholderUser]);

  const registerPlaceholder = useCallback(() => {
    persistPlaceholderUser(createCustomerPlaceholder("New WICKED Customer"));
  }, [persistPlaceholderUser]);

  const logoutPlaceholder = useCallback(() => {
    window.sessionStorage.removeItem(PLACEHOLDER_SESSION_KEY);
    window.dispatchEvent(new Event(PLACEHOLDER_SESSION_EVENT));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isAuthReady: true,
      signInPlaceholder,
      registerPlaceholder,
      logoutPlaceholder,
    }),
    [
      currentUser,
      logoutPlaceholder,
      registerPlaceholder,
      signInPlaceholder,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

function readPlaceholderSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.sessionStorage.getItem(PLACEHOLDER_SESSION_KEY);

    if (!storedUser) {
      cachedSessionRaw = null;
      cachedSessionUser = null;
      return null;
    }

    if (storedUser === cachedSessionRaw) {
      return cachedSessionUser;
    }

    const parsed = JSON.parse(storedUser) as User;
    const sanitizedUser = sanitizeSessionUser(parsed);
    const sanitizedRaw = JSON.stringify(sanitizedUser);

    if (sanitizedRaw !== storedUser) {
      window.sessionStorage.setItem(PLACEHOLDER_SESSION_KEY, sanitizedRaw);
    }

    cachedSessionRaw = sanitizedRaw;
    cachedSessionUser = sanitizedUser;
    return cachedSessionUser;
  } catch {
    window.sessionStorage.removeItem(PLACEHOLDER_SESSION_KEY);
    cachedSessionRaw = null;
    cachedSessionUser = null;
    return null;
  }
}

function sanitizeSessionUser(user: User): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    addresses: user.addresses ?? [],
    preferences: {
      marketingEmails: user.preferences?.marketingEmails ?? true,
      orderSmsUpdates: user.preferences?.orderSmsUpdates ?? true,
    },
  };
}

function subscribeToPlaceholderSession(onStoreChange: () => void) {
  window.addEventListener(PLACEHOLDER_SESSION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(PLACEHOLDER_SESSION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
