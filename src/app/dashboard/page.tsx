"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  Clock,
  User,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const router = useRouter();

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      doctor: "Dra. María González",
      specialty: "Cardiología",
      date: "2025-04-15",
      time: "10:00",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Carlos Rodríguez",
      specialty: "Dermatología",
      date: "2025-04-20",
      time: "15:30",
      status: "pending",
    },
  ];

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
            <span className="text-xl font-bold text-teal-600">
              Cronos Health
            </span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center p-4 border-b">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage
                src="/placeholder.svg?height=40&width=40"
                alt="Avatar"
              />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Juan Pérez</p>
              <p className="text-sm text-gray-500">Paciente</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded-md bg-gray-100 text-teal-600 font-medium"
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              Mis Turnos
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <User className="mr-3 h-5 w-5" />
              Mi Perfil
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <FileText className="mr-3 h-5 w-5" />
              Historial Médico
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Chat
            </Link>
            <Link
              href="/dashboard/notifications"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Bell className="mr-3 h-5 w-5" />
              Notificaciones
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Settings className="mr-3 h-5 w-5" />
              Configuración
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => {
                document.cookie =
                  "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                localStorage.removeItem("token");
                router.push("/login");
              }}
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
          <h1 className="text-xl font-semibold">Panel del Paciente</h1>
        </header>
        <main className="p-4 md:p-6">
          <Tabs defaultValue="appointments">
            <TabsList className="mb-4">
              <TabsTrigger value="appointments">Mis Turnos</TabsTrigger>
              <TabsTrigger value="schedule">Agendar Turno</TabsTrigger>
            </TabsList>
            <TabsContent value="appointments" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Próximos Turnos</CardTitle>
                    <CardDescription>
                      Tus citas médicas programadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.length > 0 ? (
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
                                    appointment.status === "confirmed"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {appointment.status === "confirmed"
                                    ? "Confirmado"
                                    : "Pendiente"}
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
                              <div className="flex mt-3 space-x-2">
                                <Button variant="outline" size="sm">
                                  Reprogramar
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">
                          No tienes turnos programados
                        </p>
                        <Button className="mt-2" variant="outline">
                          Agendar Turno
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
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Agendar Nuevo Turno</CardTitle>
                  <CardDescription>
                    Selecciona especialidad, médico y horario disponible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Appointment scheduling form would go here */}
                    <p className="text-center py-6 text-gray-500">
                      Formulario de agendamiento de turnos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
