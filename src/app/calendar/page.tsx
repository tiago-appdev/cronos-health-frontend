"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, ChevronLeft, ChevronRight, User, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState("day")
  const router = useRouter()

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      patient: "Ana Martínez",
      time: "09:00",
      duration: 30,
      type: "Consulta",
      status: "confirmed",
    },
    {
      id: 2,
      patient: "Roberto Sánchez",
      time: "10:00",
      duration: 45,
      type: "Control",
      status: "confirmed",
    },
    {
      id: 3,
      patient: "Carmen López",
      time: "11:30",
      duration: 30,
      type: "Consulta",
      status: "pending",
    },
    {
      id: 4,
      patient: "Miguel Torres",
      time: "14:00",
      duration: 60,
      type: "Primera Visita",
      status: "confirmed",
    },
    {
      id: 5,
      patient: "Laura Gómez",
      time: "15:30",
      duration: 30,
      type: "Consulta",
      status: "confirmed",
    },
  ]

  // Generate time slots for the day view
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8 // Start from 8 AM
    return `${hour.toString().padStart(2, "0")}:00`
  })

  // Filter appointments for the current time slot
  const getAppointmentsForTimeSlot = (slot: string) => {
    return appointments.filter((app) => {
      const appHour = Number.parseInt(app.time.split(":")[0])
      const slotHour = Number.parseInt(slot.split(":")[0])
      return appHour === slotHour || (appHour === slotHour - 1 && Number.parseInt(app.time.split(":")[1]) >= 30)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
              <AvatarFallback>DG</AvatarFallback>
            </Avatar>
            <span className="font-medium">Dr. Gabriel Méndez</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with calendar */}
          <div className="md:w-80">
            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
                <CardDescription>Selecciona una fecha</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <span className="text-sm">Confirmado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm">Pendiente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Cancelado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main calendar view */}
          <div className="flex-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Agenda</CardTitle>
                    <CardDescription>
                      {date?.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Select defaultValue={view} onValueChange={setView}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Vista" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Día</SelectItem>
                        <SelectItem value="week">Semana</SelectItem>
                        <SelectItem value="month">Mes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Turno
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === "day" && (
                  <div className="space-y-2">
                    {timeSlots.map((slot) => {
                      const slotAppointments = getAppointmentsForTimeSlot(slot)
                      return (
                        <div key={slot} className="grid grid-cols-[80px_1fr] gap-4">
                          <div className="text-right text-sm text-gray-500 pt-2">{slot}</div>
                          <div className="border-l pl-4 min-h-[60px]">
                            {slotAppointments.length > 0 ? (
                              <div className="space-y-2">
                                {slotAppointments.map((app) => (
                                  <div
                                    key={app.id}
                                    className={`p-2 rounded-md ${
                                      app.status === "confirmed"
                                        ? "bg-teal-50 border-teal-200 border"
                                        : "bg-amber-50 border-amber-200 border"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center">
                                        <Avatar className="h-6 w-6 mr-2">
                                          <AvatarFallback>
                                            {app.patient
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{app.patient}</p>
                                          <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>
                                              {app.time} ({app.duration} min) - {app.type}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant={app.status === "confirmed" ? "default" : "outline"}>
                                        {app.status === "confirmed" ? "Confirmado" : "Pendiente"}
                                      </Badge>
                                    </div>
                                    <div className="flex mt-2 space-x-2">
                                      <Button variant="outline" size="sm" className="h-7 text-xs">
                                        Ver Detalles
                                      </Button>
                                      <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <User className="h-3 w-3 mr-1" />
                                        Historial
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center border border-dashed rounded-md">
                                <p className="text-sm text-gray-400">Disponible</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {view === "week" && <div className="text-center py-12 text-gray-500">Vista semanal en desarrollo</div>}

                {view === "month" && <div className="text-center py-12 text-gray-500">Vista mensual en desarrollo</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
