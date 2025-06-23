import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/ui/notification-center";
import {
  CalendarIcon,
  User,
  FileText,
  MessageSquare,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface SidebarProps {
  currentPage: string; // 'dashboard' | 'profile' | 'history' | 'medical-panel' | 'chat' | 'notifications'
}

interface IUser {
  id: string;
  name: string;
  email: string;
  user_type: "patient" | "doctor" | "admin";
}

// Navigation items based on user type
export const getNavigationItems = (user: IUser | null) => {
  const baseItems = [
    {
      id: "profile",
      href: "/dashboard/profile",
      icon: User,
      label: "Mi Perfil",
      active: true,
    },
    {
      id: "chat",
      href: "/dashboard/chat",
      icon: MessageSquare,
      label: "Chat",
      active: false,
    },
  ];
  if (user?.user_type === "patient") {
    return [
      {
        id: "dashboard",
        href: "/dashboard",
        icon: CalendarIcon,
        label: "Mis Turnos",
        active: false,
      },
      ...baseItems.slice(0, 1), // Profile
      {
        id: "history",
        href: "/dashboard/history",
        icon: FileText,
        label: "Historial Médico",
        active: false,
      },
      ...baseItems.slice(1), // Chat
    ];
  } else {
    return [
      {
        id: "dashboard",
        href: "/dashboard",
        icon: CalendarIcon,
        label: "Agenda",
        active: false,
      },
      ...baseItems.slice(0, 1), // Profile
      {
        id: "medical-panel",
        href: "/dashboard/medical-panel",
        icon: FileText,
        label: "Historial de Pacientes",
        active: false,
      },
      ...baseItems.slice(1), // Chat
    ];
  }
};

export function Sidebar({ currentPage }: SidebarProps) {
  const { user, logout, loggingOut } = useAuth();

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format user type for display
  const getUserTypeDisplay = (userType: string) => {
    return userType === "patient" ? "Paciente" : "Médico";
  };

  const navigationItems = getNavigationItems(user);

  const handleLogout = async () => {
    if (!loggingOut) {
      logout();
    }
  };

  // Show logout overlay when logging out
  if (loggingOut) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg font-medium text-gray-700">
            Cerrando sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-white border-r">
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-600"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="text-xl font-bold text-teal-600">Cronos Health</span>
        </Link>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {" "}
        <div className="flex items-center p-4 border-b">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage
              src="/placeholder.svg?height=40&width=40"
              alt="Avatar"
            />
            <AvatarFallback className="bg-teal-100 text-teal-700">
              {user ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">
              {user ? getUserTypeDisplay(user.user_type) : "Usuario"}
            </p>
          </div>
          <NotificationCenter />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center p-2 rounded-md ${
                  isActive
                    ? "bg-gray-100 text-teal-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <p className="text-lg font-medium text-gray-700">
                    Cerrando sesión...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
