"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, FileText, MessageSquare, Bell, Settings, LogOut, Search, Plus, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MedicalPanelPage() {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)

  // Mock patients data
  const patients = [
    {
      id: "1",
      name: "Ana Martínez",
      age: 42,
      lastVisit: "2025-03-10",
      condition: "Hipertensión",
    },
    {
      id: "2",
      name: "Roberto Sánchez",
      age: 35,
      lastVisit: "2025-04-01",
      condition: "Diabetes Tipo 2",
    },
    {
      id: "3",
      name: "Carmen López",
      age: 28,
      lastVisit: "2025-03-25",
      condition: "Migraña",
    },
  ]

  // Mock medical records
  const medicalRecords = [
    {
      id: "1",
      date: "2025-03-10",
      diagnosis: "Hipertensión arterial",
      treatment: "Losartán 50mg, una vez al día",
      notes:
        "Paciente presenta presión arterial elevada. Se recomienda dieta baja en sodio y actividad física regular.",
    },
    {
      id: "2",
      date: "2024-12-15",
      diagnosis: "Resfriado común",
      treatment: "Paracetamol 500mg cada 8 horas",
      notes: "Síntomas de congestión nasal y dolor de garganta. Reposo y abundante líquido.",
    },
  ]

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
              <AvatarFallback>DG</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Dr. Gabriel Méndez</p>
              <p className="text-sm text-gray-500">Cardiología</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <CalendarIcon className="mr-3 h-5 w-5" />
              Agenda
            </Link>
            <Link
              href="/dashboard/medical-panel"
              className="flex items-center p-2 rounded-md bg-gray-100 text-teal-600 font-medium"
            >
              <FileText className="mr-3 h-5 w-5" />
              Historial Clínico
            </Link>
            <Link href="/dashboard/chat" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
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
              onClick={() => router.push("/login")}
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
          <h1 className="text-xl font-semibold">Panel Médico</h1>
        </header>
        <main className="p-4 md:p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Patient list */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Pacientes</CardTitle>
                <CardDescription>Historial por paciente</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input placeholder="Buscar paciente" className="pl-8" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-lg cursor-pointer ${selectedPatient === patient.id ? "bg-teal-50 border-teal-200 border" : "hover:bg-gray-50 border"}`}
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{patient.name}</h3>
                          <p className="text-sm text-gray-500">
                            {patient.age} años - {patient.condition}
                          </p>
                          <p className="text-xs text-gray-400">Última visita: {patient.lastVisit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient medical history */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Historial Clínico</CardTitle>
                <CardDescription>
                  {selectedPatient
                    ? `Paciente: ${patients.find((p) => p.id === selectedPatient)?.name}`
                    : "Selecciona un paciente para ver su historial"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Registros médicos</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Nuevo Registro
                      </Button>
                    </div>

                    <Tabs defaultValue="records">
                      <TabsList>
                        <TabsTrigger value="records">Registros</TabsTrigger>
                        <TabsTrigger value="prescriptions">Recetas</TabsTrigger>
                        <TabsTrigger value="tests">Exámenes</TabsTrigger>
                      </TabsList>
                      <TabsContent value="records" className="space-y-4 mt-4">
                        {medicalRecords.map((record) => (
                          <div key={record.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{record.date}</h4>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Diagnóstico:</p>
                                <p>{record.diagnosis}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Tratamiento:</p>
                                <p>{record.treatment}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Notas:</p>
                                <p className="text-sm">{record.notes}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="prescriptions">
                        <div className="py-8 text-center text-gray-500">No hay recetas registradas</div>
                      </TabsContent>
                      <TabsContent value="tests">
                        <div className="py-8 text-center text-gray-500">No hay exámenes registrados</div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Agregar Nota</h3>
                      <Textarea placeholder="Escribir notas sobre el paciente..." className="min-h-[100px]" />
                      <Button className="mt-2">Guardar Nota</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No hay paciente seleccionado</h3>
                    <p className="text-gray-500 mb-4">
                      Selecciona un paciente de la lista para ver su historial clínico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
