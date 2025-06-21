"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  Users,
  UserCog,
  Settings,
  LogOut,
  BarChart3,
  Building,
  FileText,
  Bell,
  Search,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Eye,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { adminApi, DoctorProfile, type User } from "@/services/admin-api";
import { ProtectedRoute } from "@/components/protected-route";

function AdminPageContent() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const userData = await adminApi.getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  // Filter users based on search and type
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedUserType === "all" || u.user_type === selectedUserType;
    
    return matchesSearch && matchesType;
  });

  // Get user statistics
  const stats = {
    total: users.length,
    patients: users.filter(u => u.user_type === "patient").length,
    doctors: users.filter(u => u.user_type === "doctor").length,
    admins: users.filter(u => u.user_type === "admin").length,
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        type: "error",
      });
    }
  };

  // Get user type badge color
  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "doctor":
        return <Badge variant="default">Médico</Badge>;
      case "patient":
        return <Badge variant="secondary">Paciente</Badge>;
      default:
        return <Badge variant="outline">{userType}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
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
          <div className="flex items-center p-4 border-b">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
              <AvatarFallback className="bg-red-100 text-red-700">
                {getInitials(user?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">Administrador</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/admin" className="flex items-center p-2 rounded-md bg-gray-100 text-teal-600 font-medium">
              <BarChart3 className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Users className="mr-3 h-5 w-5" />
              Usuarios
            </Link>
            <Link href="/admin/doctors" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <UserCog className="mr-3 h-5 w-5" />
              Médicos
            </Link>
            <Link
              href="/admin/appointments"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              Turnos
            </Link>
            <Link href="/admin/clinics" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Building className="mr-3 h-5 w-5" />
              Clínicas
            </Link>
            <Link href="/admin/reports" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <FileText className="mr-3 h-5 w-5" />
              Reportes
            </Link>
            <Link
              href="/admin/notifications"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Bell className="mr-3 h-5 w-5" />
              Notificaciones
            </Link>
            <Link href="/admin/settings" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Settings className="mr-3 h-5 w-5" />
              Configuración
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
        </header>
        <main className="p-4 md:p-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">Usuarios registrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.patients}</div>
                <p className="text-xs text-gray-500">Pacientes activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Médicos</CardTitle>
                <UserCog className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.doctors}</div>
                <p className="text-xs text-gray-500">Médicos activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Settings className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.admins}</div>
                <p className="text-xs text-gray-500">Admins del sistema</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra todos los usuarios del sistema</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedUserType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUserType("all")}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={selectedUserType === "patient" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUserType("patient")}
                  >
                    Pacientes
                  </Button>
                  <Button
                    variant={selectedUserType === "doctor" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUserType("doctor")}
                  >
                    Médicos
                  </Button>
                  <Button
                    variant={selectedUserType === "admin" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedUserType("admin")}
                  >
                    Admins
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Cargando usuarios...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{user.name}</h3>
                              {getUserTypeBadge(user.user_type)}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Registrado: {formatDate(user.created_at)}
                            </p>
                            {user.profile && (
                              <div className="text-xs text-gray-500 mt-1">
                                {user.user_type === "doctor" && user.profile && (user.profile as DoctorProfile).specialty && (
                                  <span>Especialidad: {(user.profile as DoctorProfile).specialty}</span>
                                )}
                                {user.user_type === "patient" && user.profile.phone && (
                                  <span>Teléfono: {user.profile.phone}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.user_type !== "admin" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {!user.profile && user.user_type !== "admin" && (
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No se encontraron usuarios</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth={true} allowedUserTypes={["admin"]}>
      <AdminPageContent />
    </ProtectedRoute>
  );
}