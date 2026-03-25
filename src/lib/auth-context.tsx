"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  signup: async () => ({}),
  logout: async () => {},
});

function mapSupabaseUser(su: SupabaseUser): AppUser {
  return {
    id: su.id,
    email: su.email || "",
    name: su.user_metadata?.full_name || su.email?.split("@")[0] || "User",
    role: su.user_metadata?.role || "admin",
    avatar: su.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: su } } = await supabase.auth.getUser();
      setUser(su ? mapSupabaseUser(su) : null);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signup = async (email: string, password: string, name: string): Promise<{ error?: string; needsConfirmation?: boolean }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    return { needsConfirmation: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
