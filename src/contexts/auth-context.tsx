"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  user_type: "patient" | "doctor" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  loggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  // Function to fetch user data from token
  const fetchUserFromToken = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/user", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        localStorage.removeItem("token");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      return null;
    }
  };

  // Login function that returns user data
  const login = async (token: string): Promise<User | null> => {
    localStorage.setItem("token", token);
    const userData = await fetchUserFromToken(token);
    setUser(userData);
    return userData;
  };

  // Logout function with proper loading state
  const logout = async () => {
    setLoggingOut(true);

    try {
      // Add a small delay to prevent flash
      await new Promise((resolve) => setTimeout(resolve, 300));

      localStorage.removeItem("token");
      setUser(null);

      // Navigate to home page
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const userData = await fetchUserFromToken(token);
        setUser(userData);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    loggingOut,
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
