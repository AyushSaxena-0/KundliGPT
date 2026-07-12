"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  premium_tier: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) throw new Error("Email and password are required.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      if (SUPABASE_URL && SUPABASE_KEY) {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error_description || data.msg || data.message || "Invalid email or password");
        }

        const token = data.access_token;
        localStorage.setItem("auth_token", token);

        // Fetch profile details or lazy create it on the backend
        let profile = null;
        try {
          profile = await api.getProfile();
        } catch (err) {
          console.error("Failed to load user profile, using defaults", err);
        }

        const userObj: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.full_name || email.split("@")[0],
          is_admin: profile?.is_admin || email === "admin@example.com" || false,
          premium_tier: profile?.premium_tier || "free"
        };

        localStorage.setItem("auth_user", JSON.stringify(userObj));
        setUser(userObj);
        router.push("/chat");
      } else {
        // Fallback to local/offline mock authentication
        const mockUser: UserProfile = {
          id: email === "admin@example.com" ? "usr-mock-admin" : `usr-${Date.now()}`,
          email: email,
          name: email.split("@")[0],
          is_admin: email === "admin@example.com",
          premium_tier: "free"
        };
        
        localStorage.setItem("auth_token", "mock-jwt-token-12345");
        localStorage.setItem("auth_user", JSON.stringify(mockUser));
        setUser(mockUser);
        router.push("/chat");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password || !name) throw new Error("All fields are required.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      if (SUPABASE_URL && SUPABASE_KEY) {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.msg || data.message || "Failed to sign up.");
        }

        if (data.session) {
          const userObj: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || name,
            is_admin: false,
            premium_tier: "free"
          };
          localStorage.setItem("auth_token", data.session.access_token);
          localStorage.setItem("auth_user", JSON.stringify(userObj));
          setUser(userObj);
          router.push("/chat");
        } else {
          // If verification is enabled, session won't be returned immediately
          alert("Account created successfully! Verification email has been sent. Please confirm your email before logging in.");
          router.push("/login");
        }
      } else {
        // Fallback mock signup
        const mockUser: UserProfile = {
          id: `usr-${Date.now()}`,
          email: email,
          name: name,
          is_admin: false,
          premium_tier: "free"
        };
        
        localStorage.setItem("auth_token", "mock-jwt-token-12345");
        localStorage.setItem("auth_user", JSON.stringify(mockUser));
        setUser(mockUser);
        router.push("/chat");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    if (SUPABASE_URL && SUPABASE_KEY && token && token !== "mock-jwt-token-12345") {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Supabase logout endpoint failed:", err);
      }
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    setLoading(false);
    router.push("/");
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email) throw new Error("Email address is required.");

      if (SUPABASE_URL && SUPABASE_KEY) {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.msg || data.message || "Failed to send password reset link.");
        }
      } else {
        // Mock behavior
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
