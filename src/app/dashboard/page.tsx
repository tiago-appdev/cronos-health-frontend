"use client";

import { useState, useEffect, useMemo } from "react";
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
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/ui/sidebar";
import { AppointmentBookingForm } from "@/components/ui/appointment-booking-form";
import { SurveyNotification } from "@/components/ui/survey-notification";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/components/ui/toast-context";
import { appointmentApi } from "@/services/api";

interface Appointment {
  fullDate: string | number | Date;
  id: number;
  doctor: string;
  specialty: string;
  patient?: string;
  patientAge?: number;
  date: string;
  time: string;
  status: string;
}

function DashboardContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { showSurveyToast } = useSurvey();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [surveyedAppointments, setSurveyedAppointments] = useState<Set<number>>(
    new Set()
  );

  // Sort appointments by date and time
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      // Parse the fullDate for both appointments
      let dateA = new Date(a.fullDate);
      let dateB = new Date(b.fullDate);

      // If fullDate is not available or invalid, try to construct from date and time
      if (isNaN(dateA.getTime())) {
        dateA = new Date(`${a.date} ${a.time}`);
      }
      if (isNaN(dateB.getTime())) {
        dateB = new Date(`${b.date} ${b.time}`);
      }

      // If dates are still invalid, fall back to basic string comparison
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        // Sort by status priority: scheduled > completed > canceled
        const statusOrder = { scheduled: 1, completed: 2, canceled: 3 };
        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;

        if (statusA !== statusB) {
          return statusA - statusB;
        }

        // If same status, sort by date string
        return a.date.localeCompare(b.date);
      }

      const now = new Date();
      const isAFuture = dateA > now;
      const isBFuture = dateB > now;

      // Group by time relationship to now
      if (isAFuture && isBFuture) {
        // Both future: sort chronologically (earliest first)
        return dateA.getTime() - dateB.getTime();
      } else if (!isAFuture && !isBFuture) {
        // Both past: sort reverse chronologically (most recent first)
        return dateB.getTime() - dateA.getTime();
      } else {
        // Mixed: future appointments first
        return isAFuture ? -1 : 1;
      }
    });
  }, [appointments]);

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

  // Mark appointment as completed (for doctors)
  const handleCompleteAppointment = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        toast({
          title: "Éxito",
          description: "Cita marcada como completada",
          type: "success",
        });

        // Find the appointment and show survey toast for patient
        const completedAppointment = appointments.find(
          (apt) => apt.id === appointmentId
        );
        if (completedAppointment && data.appointment?.patient_id) {
          // This would typically be handled via real-time notifications
          // For now, it will be picked up by the SurveyNotification component
          showSurveyToast({
            appointmentId: appointmentId,
            doctorName: completedAppointment.doctor,
            specialty: completedAppointment.specialty,
            appointmentDate: completedAppointment.date,
          });
        }

        fetchAppointments(); // Refresh appointments
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "No se pudo completar la cita",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast({
        title: "Error",
        description: "Error al completar la cita",
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

  // Fetch surveyed appointments for patients
  useEffect(() => {
    const fetchSurveyedAppointments = async () => {
      if (user?.user_type !== "patient") return;
      try {
        const surveys = await appointmentApi.getMySurveys();
        const surveyedIds = new Set<number>();
        surveys.forEach((survey: { appointment_id?: number }) => {
          if (typeof survey.appointment_id === "number") {
            surveyedIds.add(survey.appointment_id);
          }
        });
        setSurveyedAppointments(surveyedIds);
      } catch (error) {
        console.error("Error fetching surveyed appointments:", error);
        // Don't show error toast, just fail silently for this feature
      }
    };

    if (user) {
      fetchSurveyedAppointments();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-lg font-medium text-gray-700">Saliendo...</p>
        </div>
      </div>
    );
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
        </header>{" "}
        <main className="p-4 md:p-6">
          {/* Survey Notifications for Patients */}
          {user.user_type === "patient" && <SurveyNotification />}

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
              <TabsTrigger value="appointments">{"Mis Turnos"}</TabsTrigger>
              {user.user_type === "patient" && (
                <TabsTrigger value="schedule">{"Agendar Turno"}</TabsTrigger>
              )}
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
                    ) : sortedAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {" "}
                        {sortedAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-start p-3 border rounded-lg"
                            data-testid="appointment-card"
                          >
                            <div className="mr-4 mt-1">
                              <CalendarIcon className="h-10 w-10 text-teal-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium">
                                  {user.user_type === "patient"
                                    ? `${appointment.doctor}`
                                    : appointment.patient}
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
                                {user.user_type === "patient"
                                  ? appointment.specialty
                                  : `Consulta${
                                      appointment.patientAge
                                        ? ` - ${appointment.patientAge} años`
                                        : ""
                                    }`}
                              </p>
                              <div className="flex items-center mt-2 text-sm text-gray-600">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>{appointment.date}</span>
                                <Clock className="h-4 w-4 ml-3 mr-1" />
                                <span>{appointment.time}</span>
                              </div>
                              {appointment.status === "scheduled" && (
                                <div className="flex mt-3 space-x-2">
                                  {user.user_type === "patient" ? (
                                    <>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleCancelAppointment(
                                            appointment.id
                                          )
                                        }
                                      >
                                        Cancelar
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() =>
                                          handleCompleteAppointment(
                                            appointment.id
                                          )
                                        }
                                      >
                                        Marcar Completada
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleCancelAppointment(
                                            appointment.id
                                          )
                                        }
                                      >
                                        Cancelar
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                              {/* Survey evaluation for completed appointments */}
                              {appointment.status === "completed" &&
                                user.user_type === "patient" &&
                                !surveyedAppointments.has(appointment.id) && (
                                  <div className="flex mt-3 space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Redirect to survey with appointment data
                                        const surveyUrl = `/survey?appointmentId=${
                                          appointment.id
                                        }&doctorName=${encodeURIComponent(
                                          appointment.doctor
                                        )}&specialty=${encodeURIComponent(
                                          appointment.specialty
                                        )}&date=${encodeURIComponent(
                                          appointment.date
                                        )}`;
                                        window.location.href = surveyUrl;
                                      }}
                                    >
                                      📝 Evaluar Atención
                                    </Button>
                                  </div>
                                )}
                              {/* Show message if already surveyed */}
                              {appointment.status === "completed" &&
                                user.user_type === "patient" &&
                                surveyedAppointments.has(appointment.id) && (
                                  <div className="flex mt-3">
                                    <span className="text-sm text-green-600 font-medium">
                                      ✅ Atención evaluada
                                    </span>
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
                        {user.user_type === "patient" && (
                          <Button
                            className="mt-2"
                            variant="outline"
                            onClick={() => setActiveTab("schedule")}
                          >
                            Agendar Turno"
                          </Button>
                        )}
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
                      appointmentDates={sortedAppointments.map(
                        (appointment) => {
                          const date = new Date(appointment.fullDate);
                          const localDate = new Date(
                            date.getTime() - date.getTimezoneOffset() * 60000
                          );
                          return localDate.toISOString().split("T")[0];
                        }
                      )}
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
