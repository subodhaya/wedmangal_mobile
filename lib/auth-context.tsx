import React, { createContext, useContext, useState, useEffect } from "react";
import * as storage from "./storage";
import { apiClient } from "./api-client";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "customer" | "service-owner";
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setAuthData: (data: { access: string; refresh?: string; user: any }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Try to restore token from secure storage
      const token = await storage.getItem("accessToken");
      const userStr = await storage.getItem("user");
      
      if (token && userStr) {
        setAccessToken(token);
        setUser(JSON.parse(userStr));
        console.log("✅ Auth restored from secure storage");
      }
    } catch (e) {
      console.error("Failed to restore token:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Attempting login with email:", email);
      
      // Call Django backend API using the apiClient
      const response = await apiClient.login(email, password);
      
      const data = response.data;
      const { access, refresh, user: userData } = data;

      // Save to secure storage
      await storage.setItem("accessToken", access);
      if (refresh) {
        await storage.setItem("refreshToken", refresh);
      }
      await storage.setItem("user", JSON.stringify(userData));

      setAccessToken(access);
      setUser(userData);
      console.log("✅ Login successful for user:", userData.email);
    } catch (error: any) {
      console.error("❌ Login failed:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string, role: string) => {
    setIsLoading(true);
    try {
      console.log("📝 Attempting signup with email:", email, "role:", role);
      
      // Call Django backend API using the apiClient
      const response = await apiClient.signup({
        email,
        password,
        name,
        phone,
      });

      const data = response.data;
      const { access, refresh, user: userData } = data;

      // Save to secure storage
      await storage.setItem("accessToken", access);
      if (refresh) {
        await storage.setItem("refreshToken", refresh);
      }
      await storage.setItem("user", JSON.stringify(userData));

      setAccessToken(access);
      setUser(userData);
      console.log("✅ Signup successful for user:", userData.email);
    } catch (error: any) {
      console.error("❌ Signup failed:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Remove token from axios headers immediately
    delete (apiClient as any).client?.defaults?.headers?.common?.["Authorization"];
    await Promise.allSettled([
      storage.deleteItem("accessToken"),
      storage.deleteItem("refreshToken"),
      storage.deleteItem("user"),
    ]);
    setAccessToken(null);
    setUser(null);
  };

  const setAuthData = async (data: { access: string; refresh?: string; user: any }) => {
    await storage.setItem("accessToken", data.access);
    if (data.refresh) await storage.setItem("refreshToken", data.refresh);
    await storage.setItem("user", JSON.stringify(data.user));
    setAccessToken(data.access);
    setUser(data.user);
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !!accessToken,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
