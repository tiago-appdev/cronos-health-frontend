"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CalendarIcon,
  Users,
  LogOut,
  BarChart3,
  Search,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Eye,
  UserPlus,
  X,
  Save,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { adminApi, DoctorProfile, PatientProfile, type User, type UserUpdateData, type UserCreateData } from "@/services/admin-api";
import { analyticsApi, type SystemStats, type RecentActivity, type AppointmentDistribution } from "@/services/analytics-api";
import { ProtectedRoute } from "@/components/protected-route";

function AdminPageContent() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  
  // Analytics state
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [appointmentDistribution, setAppointmentDistribution] = useState<AppointmentDistribution[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileType, setProfileType] = useState<"patient" | "doctor">("patient");
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  
  // Form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newUserFormData, setNewUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "patient",
  });
  const [profileFormData, setProfileFormData] = useState({
    // Patient fields
    date_of_birth: "",
    phone: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    // Doctor fields
    specialty: "",
    license_number: "",
    work_schedule: "",
  });

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const [statsData, activityData, distributionData] = await Promise.all([
          analyticsApi.getSystemStats(),
          analyticsApi.getRecentActivity(5),
          analyticsApi.getAppointmentDistribution(),
        ]);
        
        setStats(statsData);
        setRecentActivity(activityData);
        setAppointmentDistribution(distributionData);
      } catch (error) {
        console.error("Error loading analytics:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las analíticas",
          type: "error",
        });
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [toast]);

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

  // Create new user
  const handleNewUser = () => {
    setNewUserFormData({
      name: "",
      email: "",
      password: "",
      userType: "patient",
    });
    setShowNewUserModal(true);
  };

  // Save new user
  const handleSaveNewUser = async () => {
    try {
      const newUser = await adminApi.createUser(newUserFormData as UserCreateData);
      setUsers(prev => [newUser, ...prev]);
      setShowNewUserModal(false);
      
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        type: "error",
      });
    }
  };

  // Filter users based on search and type
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedUserType === "all" || u.user_type === selectedUserType;
    
    return matchesSearch && matchesType;
  });

  // Get user statistics from loaded data
  const userStats = {
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

  // View user details
  const handleViewUser = async (userId: string) => {
    try {
      const userData = await adminApi.getUserById(userId);
      setViewingUser(userData);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del usuario",
        type: "error",
      });
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: "",
    });
    setShowEditModal(true);
  };

  // Save user changes
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const updateData: UserUpdateData = {
        name: editFormData.name,
        email: editFormData.email,
      };

      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await adminApi.updateUser(editingUser.id, updateData);
      
      // Update user in local state
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, ...response.user } : u
      ));

      setShowEditModal(false);
      setEditingUser(null);
      
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario se han actualizado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        type: "error",
      });
    }
  };

  // Create profile
  const handleCreateProfile = (user: User, type: "patient" | "doctor") => {
    setProfileUser(user);
    setProfileType(type);
    setProfileFormData({
      date_of_birth: "",
      phone: "",
      address: "",
      emergency_contact: "",
      emergency_phone: "",
      specialty: "",
      license_number: "",
      work_schedule: "",
    });
    setShowProfileModal(true);
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!profileUser) return;

    try {
      let newProfile;
      
      if (profileType === "patient") {
        const patientData = {
          date_of_birth: profileFormData.date_of_birth || undefined,
          phone: profileFormData.phone || undefined,
          address: profileFormData.address || undefined,
          emergency_contact: profileFormData.emergency_contact || undefined,
          emergency_phone: profileFormData.emergency_phone || undefined,
        };
        newProfile = await adminApi.createPatientProfile(profileUser.id, patientData);
      } else {
        const doctorData = {
          specialty: profileFormData.specialty || undefined,
          license_number: profileFormData.license_number || undefined,
          phone: profileFormData.phone || undefined,
          work_schedule: profileFormData.work_schedule || undefined,
        };
        newProfile = await adminApi.createDoctorProfile(profileUser.id, doctorData);
      }

      // Update user in local state
      setUsers(prev => prev.map(u => 
        u.id === profileUser.id 
          ? { ...u, user_type: profileType, profile: newProfile }
          : u
      ));

      setShowProfileModal(false);
      setProfileUser(null);
      
      toast({
        title: "Perfil creado",
        description: `Se ha creado el perfil de ${profileType} exitosamente`,
        type: "success",
      });
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el perfil",
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

  // Get user type display name
  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case "admin":
        return "Administrador";
      case "doctor":
        return "Médico";
      case "patient":
        return "Paciente";
      default:
        return userType;
    }
  };

  // Get activity icon and color
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "appointment_created":
        return <CalendarIcon className="h-5 w-5 text-teal-600" />;
      case "user_registered":
        return <Users className="h-5 w-5 text-blue-600" />;
      case "survey_submitted":
        return <Bell className="h-5 w-5 text-amber-600" />;
      case "appointment_completed":
        return <CalendarIcon className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Simplified Sidebar */}
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
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Real Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {analyticsLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Cargando...</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : stats ? (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPatients}</div>
                        <p className="text-xs text-gray-500">Pacientes registrados</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Médicos</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                        <p className="text-xs text-gray-500">Médicos activos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Turnos Mensuales</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-teal-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.monthlyAppointments}</div>
                        <p className="text-xs text-gray-500">Este mes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                        <p className="text-xs text-gray-500">Últimos 30 días</p>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Últimas acciones en el sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando actividad...</span>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="bg-gray-100 p-2 rounded-full">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                              <p className="text-xs text-gray-400">{activity.timeAgo}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-gray-500">No hay actividad reciente</p>
                    )}
                  </CardContent>
                </Card>

                {/* Appointment Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Turnos</CardTitle>
                    <CardDescription>Por especialidad médica</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando...</span>
                      </div>
                    ) : appointmentDistribution.length > 0 ? (
                      <div className="space-y-4">
                        {appointmentDistribution.slice(0, 5).map((item, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">{item.specialty}</p>
                              <p className="text-sm font-medium">{item.percentage}%</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-600 h-2 rounded-full" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-gray-500">No hay datos de distribución</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* Users Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>Administra todos los usuarios del sistema</CardDescription>
                    </div>
                    <Button onClick={handleNewUser}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* User Statistics */}
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{userStats.total}</div>
                        <p className="text-xs text-gray-500">Total Usuarios</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{userStats.patients}</div>
                        <p className="text-xs text-gray-500">Pacientes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{userStats.doctors}</div>
                        <p className="text-xs text-gray-500">Médicos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{userStats.admins}</div>
                        <p className="text-xs text-gray-500">Administradores</p>
                      </CardContent>
                    </Card>
                  </div>

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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewUser(user.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
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
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCreateProfile(user, user.user_type as "patient" | "doctor")}
                                >
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
            </TabsContent>
          </Tabs>

          {/* View User Modal */}
          {showViewModal && viewingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Detalles del Usuario</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowViewModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {getInitials(viewingUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{viewingUser.name}</h3>
                      {getUserTypeBadge(viewingUser.user_type)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email:</label>
                      <p>{viewingUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo de Usuario:</label>
                      <p>{getUserTypeDisplay(viewingUser.user_type)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha de Registro:</label>
                      <p>{formatDate(viewingUser.created_at)}</p>
                    </div>
                    
                    {viewingUser.profile && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Información del Perfil:</label>
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          {viewingUser.user_type === "doctor" && (
                            <>
                              {(viewingUser.profile as DoctorProfile).specialty && (
                                <p><span className="font-medium">Especialidad:</span> {(viewingUser.profile as DoctorProfile).specialty}</p>
                              )}
                              {(viewingUser.profile as DoctorProfile).license_number && (
                                <p><span className="font-medium">Número de Licencia:</span> {(viewingUser.profile as DoctorProfile).license_number}</p>
                              )}
                              {viewingUser.profile.phone && (
                                <p><span className="font-medium">Teléfono:</span> {viewingUser.profile.phone}</p>
                              )}
                            </>
                          )}
                          {viewingUser.user_type === "patient" && (
                            <>
                              {viewingUser.profile.phone && (
                                <p><span className="font-medium">Teléfono:</span> {viewingUser.profile.phone}</p>
                              )}
                              {viewingUser.user_type === "patient" && (viewingUser.profile as PatientProfile).address && (
                                <p><span className="font-medium">Dirección:</span> {(viewingUser.profile as PatientProfile).address}</p>
                              )}
                              {viewingUser.user_type === "patient" && (viewingUser.profile as PatientProfile).emergency_contact && (
                                <p><span className="font-medium">Contacto de Emergencia:</span> {(viewingUser.profile as PatientProfile).emergency_contact}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Editar Usuario</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nueva Contraseña (opcional)</label>
                    <Input
                      type="password"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Dejar vacío para mantener la actual"
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveUser}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New User Modal */}
          {showNewUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Crear Nuevo Usuario</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewUserModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <Input
                      value={newUserFormData.name}
                      onChange={(e) => setNewUserFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={newUserFormData.email}
                      onChange={(e) => setNewUserFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contraseña</label>
                    <Input
                      type="password"
                      value={newUserFormData.password}
                      onChange={(e) => setNewUserFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Contraseña"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Usuario</label>
                    <RadioGroup
                      value={newUserFormData.userType}
                      onValueChange={(value) => setNewUserFormData(prev => ({ ...prev, userType: value }))}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="patient" id="new-patient" />
                        <Label htmlFor="new-patient">Paciente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="doctor" id="new-doctor" />
                        <Label htmlFor="new-doctor">Médico</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="new-admin" />
                        <Label htmlFor="new-admin">Administrador</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewUserModal(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveNewUser}
                      className="flex-1"
                      disabled={!newUserFormData.name || !newUserFormData.email || !newUserFormData.password}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Crear Usuario
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Profile Modal */}
          {showProfileModal && profileUser && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Crear Perfil de {profileType === "patient" ? "Paciente" : "Médico"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfileModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Usuario: <span className="font-medium">{profileUser.name}</span>
                  </div>
                  
                  {profileType === "patient" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                        <Input
                          type="date"
                          value={profileFormData.date_of_birth}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input
                          value={profileFormData.phone}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Número de teléfono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Dirección</label>
                        <Input
                          value={profileFormData.address}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Dirección completa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Contacto de Emergencia</label>
                        <Input
                          value={profileFormData.emergency_contact}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                          placeholder="Nombre del contacto"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono de Emergencia</label>
                        <Input
                          value={profileFormData.emergency_phone}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                          placeholder="Número de emergencia"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Especialidad</label>
                        <Input
                          value={profileFormData.specialty}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, specialty: e.target.value }))}
                          placeholder="Especialidad médica"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Número de Licencia</label>
                        <Input
                          value={profileFormData.license_number}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, license_number: e.target.value }))}
                          placeholder="Número de licencia médica"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <Input
                          value={profileFormData.phone}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Número de teléfono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Horario de Trabajo</label>
                        <Input
                          value={profileFormData.work_schedule}
                          onChange={(e) => setProfileFormData(prev => ({ ...prev, work_schedule: e.target.value }))}
                          placeholder="Ej: Lunes a Viernes 9:00-17:00"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowProfileModal(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Crear Perfil
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
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