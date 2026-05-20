"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AddressRow, ProfileRow } from "@/lib/supabase/database.types";
import type { User } from "@/types/user";

type AuthContextValue = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  /** Returns the active Supabase session if any (null on server / signed out). */
  session: Session | null;
  /** Reload the profile from Supabase (after profile/address mutations). */
  refreshUser: () => Promise<void>;
  /** Sign the user out via the browser client. */
  signOut: () => Promise<void>;
  /** @deprecated kept for legacy callers — redirects to /auth/login. */
  signInPlaceholder: () => void;
  /** @deprecated kept for legacy callers — redirects to /auth/register. */
  registerPlaceholder: () => void;
  /** @deprecated kept for legacy callers — calls signOut. */
  logoutPlaceholder: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [isAuthReady, setIsAuthReady] = useState(!supabase);

  const fetchUser = useCallback(async () => {
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [profile, addresses] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true }),
    ]);

    const profileRow = (profile.data ?? null) as ProfileRow | null;
    const addressRows = (addresses.data ?? []) as AddressRow[];

    const mappedUser: User = {
      id: user.id,
      email: profileRow?.email ?? user.email ?? "",
      name: profileRow?.full_name ?? "",
      phone: profileRow?.phone ?? "",
      addresses: addressRows.map((row) => ({
        id: row.id,
        label: row.label,
        recipientName: row.full_name,
        phone: row.phone ?? "",
        line1: row.address_line_1,
        line2: row.address_line_2 ?? undefined,
        city: row.city,
        province: row.province ?? "",
        postalCode: row.postal_code,
        country: row.country,
        isDefault: row.is_default,
      })),
      preferences: {
        // Marketing is opt-in: default to false when profile row hasn't
        // been written yet so we don't silently subscribe a new user.
        marketingEmails: profileRow?.marketing_emails ?? false,
        orderSmsUpdates: profileRow?.order_sms_updates ?? false,
      },
      createdAt: profileRow?.created_at ?? user.created_at,
    };

    return mappedUser;
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const user = await fetchUser();
    setCurrentUser(user);
  }, [fetchUser]);

  useEffect(() => {
    if (!supabase) {
      setIsAuthReady(true);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
    });

    void fetchUser().then((user) => {
      if (!active) return;
      setCurrentUser(user);
      setIsAuthReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        const user = await fetchUser();
        setCurrentUser(user);
        router.refresh();
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [fetchUser, router, supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
    router.refresh();
  }, [router, supabase]);

  const signInPlaceholder = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  const registerPlaceholder = useCallback(() => {
    router.push("/auth/register");
  }, [router]);

  const logoutPlaceholder = useCallback(() => {
    void signOut();
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isAuthReady,
      session,
      refreshUser,
      signOut,
      signInPlaceholder,
      registerPlaceholder,
      logoutPlaceholder,
    }),
    [
      currentUser,
      isAuthReady,
      logoutPlaceholder,
      refreshUser,
      registerPlaceholder,
      session,
      signInPlaceholder,
      signOut,
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
