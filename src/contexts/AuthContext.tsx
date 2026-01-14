"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient from "@/utils/axios";
import { getAccessToken, removeAccessToken } from "@/utils/cookies";
import { useRouter } from "next/navigation";

// User type matching your FastAPI backend response
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  [key: string]: any; // Allow additional fields from backend
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info from FastAPI backend
  const fetchUser = useCallback(async () => {
    try {
      const token = getAccessToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Call your FastAPI endpoint to get current user
      // Adjust the endpoint path based on your FastAPI routes
      const response = await apiClient.get<User>("/api/auth/me");
      setUser(response.data);
    } catch (error: any) {
      // If 401, token is invalid - clear it
      if (error.response?.status === 401) {
        removeAccessToken();
        setUser(null);
      } else {
        console.error("Error fetching user:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = async () => {
    try {
      // Optionally call FastAPI logout endpoint if you have one
      // await apiClient.post("/api/auth/logout");

      // Clear token from cookies
      removeAccessToken();
      setUser(null);

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Still clear token even if API call fails
      removeAccessToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
