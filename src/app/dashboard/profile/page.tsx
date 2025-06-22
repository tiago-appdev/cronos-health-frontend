"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/ui/sidebar";
import {
  Loader2,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Stethoscope,
  Clock,
  Shield,
  Calendar,
} from "lucide-react";
import { profileApi } from "@/lib/api-medical-records";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";

interface PatientProfile {
  id: number;
  name: string;
  email: string;
  user_type: "patient";
  created_at: string;
  date_of_birth: string;
  phone: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
}

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  user_type: "doctor";
  created_at: string;
  specialty: string;
  license_number: string;
  phone: string;
  work_schedule: string;
}

type UserProfile = PatientProfile | DoctorProfile;

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });    } catch {
      return "Fecha no disponible";
    }
  };

  // Helper function to calculate age
  const calculateAge = (birthDate: string): number => {
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }
      return age;    } catch {
      return 0;
    }
  };

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        console.log("Loading profile for user:", user.id);

        const profileData = await profileApi.getProfile();
        console.log("Profile data:", profileData);
        setProfile(profileData);
        setEditedProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil del usuario",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      setSaving(true);
      console.log("Updating profile:", editedProfile);

      const updatedProfile = await profileApi.updateProfile(editedProfile);
      console.log("Updated profile:", updatedProfile);

      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setEditing(false);

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    if (!editedProfile) return;

    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setEditing(false);  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="profile" />

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-semibold">Mi Perfil</h1>
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Cargando perfil...</span>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src="/placeholder.svg?height=96&width=96"
                        alt="Avatar"
                      />
                      <AvatarFallback className="text-2xl">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <Badge
                          variant={
                            profile.user_type === "doctor"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {profile.user_type === "doctor" ? (
                            <>
                              <Stethoscope className="h-3 w-3 mr-1" />
                              Médico
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Paciente
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.user_type === "doctor" && (
                        <div className="flex items-center text-gray-600">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>{(profile as DoctorProfile).specialty}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-500 mt-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          Miembro desde {formatDate(profile.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Details */}
              {profile.user_type === "patient" ? (
                // Patient Profile
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Personal</CardTitle>
                      <CardDescription>
                        Datos básicos del paciente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre Completo</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={editedProfile?.name || ""}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Correo Electrónico</Label>
                        {editing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editedProfile?.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">
                          Fecha de Nacimiento
                        </Label>
                        {editing ? (
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={
                              (editedProfile as PatientProfile)
                                ?.date_of_birth || ""
                            }
                            onChange={(e) =>
                              handleInputChange("date_of_birth", e.target.value)
                            }
                          />
                        ) : (
                          <div className="mt-1">
                            <p className="text-sm text-gray-900">
                              {formatDate(
                                (profile as PatientProfile).date_of_birth
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {calculateAge(
                                (profile as PatientProfile).date_of_birth
                              )}{" "}
                              años
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            value={
                              (editedProfile as PatientProfile)?.phone || ""
                            }
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {(profile as PatientProfile).phone}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="address">Dirección</Label>
                        {editing ? (
                          <Textarea
                            id="address"
                            value={
                              (editedProfile as PatientProfile)?.address || ""
                            }
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-start">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-900">
                              {(profile as PatientProfile).address}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Contacto de Emergencia</CardTitle>
                      <CardDescription>
                        Información para casos de emergencia
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="emergency_contact">
                          Nombre del Contacto
                        </Label>
                        {editing ? (
                          <Input
                            id="emergency_contact"
                            value={
                              (editedProfile as PatientProfile)
                                ?.emergency_contact || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "emergency_contact",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {(profile as PatientProfile).emergency_contact}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="emergency_phone">
                          Teléfono de Emergencia
                        </Label>
                        {editing ? (
                          <Input
                            id="emergency_phone"
                            value={
                              (editedProfile as PatientProfile)
                                ?.emergency_phone || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "emergency_phone",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-red-400" />
                            <span className="text-sm text-gray-900">
                              {(profile as PatientProfile).emergency_phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Doctor Profile
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Profesional</CardTitle>
                      <CardDescription>Datos del médico</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre Completo</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={editedProfile?.name || ""}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Correo Electrónico</Label>
                        {editing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editedProfile?.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="specialty">Especialidad</Label>
                        {editing ? (
                          <Input
                            id="specialty"
                            value={
                              (editedProfile as DoctorProfile)?.specialty || ""
                            }
                            onChange={(e) =>
                              handleInputChange("specialty", e.target.value)
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-center">
                            <Stethoscope className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {(profile as DoctorProfile).specialty}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="license_number">
                          Número de Licencia
                        </Label>
                        {editing ? (
                          <Input
                            id="license_number"
                            value={
                              (editedProfile as DoctorProfile)
                                ?.license_number || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "license_number",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {(profile as DoctorProfile).license_number}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Contacto</CardTitle>
                      <CardDescription>
                        Datos de contacto y horarios
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            value={
                              (editedProfile as DoctorProfile)?.phone || ""
                            }
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {(profile as DoctorProfile).phone}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="work_schedule">
                          Horario de Trabajo
                        </Label>
                        {editing ? (
                          <Textarea
                            id="work_schedule"
                            value={
                              (editedProfile as DoctorProfile)?.work_schedule ||
                              ""
                            }
                            onChange={(e) =>
                              handleInputChange("work_schedule", e.target.value)
                            }
                          />
                        ) : (
                          <div className="mt-1 flex items-start">
                            <Clock className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-900">
                              {(profile as DoctorProfile).work_schedule}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No se pudo cargar la información del perfil
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
