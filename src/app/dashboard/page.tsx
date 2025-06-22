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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/ui/sidebar";
import { AppointmentBookingForm } from "@/components/ui/appointment-booking-form";
import { useToast } from "@/components/ui/toast-context";

interface Appointment {
  fullDate: string | number | Date;
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

function DashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");

  // Format user type for display
  const getUserTypeDisplay = (userType: string) => {
    return userType === "patient" ? "Paciente" : "Médico";
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token || "" },
        }
      );

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Cita cancelada exitosamente",
          type: "success",
        });
        fetchAppointments(); // Refresh appointments
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "No se pudo cancelar la cita",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast({
        title: "Error",
        description: "Error al cancelar la cita",
        type: "error",
      });
    }
  };

  // Fetch user's appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:4000/api/appointments", {
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        console.error("Failed to fetch appointments");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Use shared sidebar */}
      <Sidebar currentPage="dashboard" />

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
          <h1 className="text-xl font-semibold">
            Panel del {getUserTypeDisplay(user.user_type)}
          </h1>
        </header>
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido, {user.name}
            </h2>
            <p className="text-gray-600">
              Aquí puedes gestionar tus{" "}
              {user.user_type === "patient"
                ? "turnos y consultas médicas"
                : "citas con pacientes"}
              .
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="appointments">
                {user.user_type === "patient" ? "Mis Turnos" : "Mis Citas"}
              </TabsTrigger>
              <TabsTrigger value="schedule">
                {user.user_type === "patient"
                  ? "Agendar Turno"
                  : "Programar Cita"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="appointments" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>
                      {user.user_type === "patient"
                        ? "Próximos Turnos"
                        : "Próximas Citas"}
                    </CardTitle>
                    <CardDescription>
                      {user.user_type === "patient"
                        ? "Tus citas médicas programadas"
                        : "Citas programadas con pacientes"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Cargando...</p>
                      </div>
                    ) : appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-start p-3 border rounded-lg"
                          >
                            <div className="mr-4 mt-1">
                              <CalendarIcon className="h-10 w-10 text-teal-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium">
                                  {appointment.doctor}
                                </h3>
                                <Badge
                                  variant={
                                    appointment.status === "scheduled"
                                      ? "default"
                                      : appointment.status === "completed"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {appointment.status === "scheduled"
                                    ? "Programado"
                                    : appointment.status === "completed"
                                    ? "Completado"
                                    : "Cancelado"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                {appointment.specialty}
                              </p>
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>{appointment.date}</span>
                                <Clock className="h-4 w-4 ml-3 mr-1" />
                                <span>{appointment.time}</span>
                              </div>
                              {appointment.status === "scheduled" && (
                                <div className="flex mt-3 space-x-2">
                                  <Button variant="outline" size="sm">
                                    Reprogramar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelAppointment(appointment.id)
                                    }
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">
                          {user.user_type === "patient"
                            ? "No tienes turnos programados"
                            : "No tienes citas programadas"}
                        </p>
                        <Button
                          className="mt-2"
                          variant="outline"
                          onClick={() => setActiveTab("schedule")}
                        >
                          {user.user_type === "patient"
                            ? "Agendar Turno"
                            : "Programar Cita"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Calendario</CardTitle>
                    <CardDescription>
                      Vista mensual de tus citas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                      appointmentDates={appointments.map((appointment) => {
                        const date = new Date(appointment.fullDate);
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        );
                        return localDate.toISOString().split("T")[0];
                      })}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="schedule">
              {user.user_type === "patient" ? (
                <AppointmentBookingForm
                  onAppointmentBooked={fetchAppointments}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Citas</CardTitle>
                    <CardDescription>
                      Como médico, puedes ver y gestionar las citas de tus
                      pacientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-center py-6 text-gray-500">
                        Panel de gestión de citas para médicos (próximamente)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardContent />
    </ProtectedRoute>
  );
}