"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedUserTypes?: ("patient" | "doctor" | "admin")[];
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo,
  allowedUserTypes 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // If auth is not required but user is authenticated, redirect them
    if (!requireAuth && isAuthenticated && redirectTo) {
      // Redirect admins to /admin, others to /dashboard
      if (user?.user_type === "admin") {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
      return;
    }

    // If user types are specified, check if user has permission
    if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
      // Redirect based on user type
      if (user.user_type === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      return;
    }
  }, [user, loading, isAuthenticated, requireAuth, redirectTo, allowedUserTypes, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
}