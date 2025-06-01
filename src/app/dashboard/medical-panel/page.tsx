"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { appointmentsApi, medicalRecordsApi } from "@/services/api";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/contexts/auth-context";

interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number;
  lastVisit?: string;
  condition?: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  createdAt: string;
  prescriptions?: Prescription[];
  tests?: MedicalTest[];
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  createdAt: string;
}

interface MedicalTest {
  id: string;
  testName: string;
  testDate?: string;
  results?: string;
  notes?: string;
  createdAt: string;
}

interface PatientNote {
  id: string;
  patientId: string;
  note: string;
  createdAt: string;
}

export default function MedicalPanelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientNotes, setPatientNotes] = useState<PatientNote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Load patients from appointments (doctors who have appointments)
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const appointments = await appointmentsApi.getAppointments();

        // Extract unique patients from appointments
        const uniquePatients = appointments.reduce(
          (acc: Patient[], appointment: any) => {
            if (
              appointment.patient &&
              !acc.find((p) => p.id === appointment.patient.id)
            ) {
              acc.push({
                id: appointment.patient.id,
                name: appointment.patient.name,
                email: appointment.patient.email,
                age: appointment.patient.age,
                lastVisit: appointment.appointmentDate,
                condition: appointment.patient.condition || "Sin especificar",
              });
            }
            return acc;
          },
          []
        );

        setPatients(uniquePatients);
      } catch (error) {
        console.error("Error loading patients:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los pacientes",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [toast]);

  // Load medical records when a patient is selected
  useEffect(() => {
    const loadPatientData = async () => {
      if (!selectedPatient) return;

      try {
        setLoadingRecords(true);
        setLoadingNotes(true);

        // Load medical records and notes in parallel
        const [records, notes] = await Promise.all([
          medicalRecordsApi.getPatientRecords(selectedPatient),
          medicalRecordsApi.getPatientNotes(selectedPatient),
        ]);

        setMedicalRecords(records);
        setPatientNotes(notes);
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del paciente",
          type: "error",
        });
      } finally {
        setLoadingRecords(false);
        setLoadingNotes(false);
      }
    };

    loadPatientData();
  }, [selectedPatient, toast]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!selectedPatient || !newNote.trim()) return;

    try {
      const note = await medicalRecordsApi.addNote({
        patientId: selectedPatient,
        note: newNote.trim(),
      });

      setPatientNotes((prev) => [note, ...prev]);
      setNewNote("");

      toast({
        title: "Éxito",
        description: "Nota agregada correctamente",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la nota",
        type: "error",
      });
    }
  };

  // Handle creating a new medical record
  const handleCreateRecord = async () => {
    if (!selectedPatient) return;

    try {
      // This would typically open a modal or form
      // For now, we'll create a basic record
      const record = await medicalRecordsApi.createRecord({
        patientId: selectedPatient,
        diagnosis: "Nueva consulta",
        treatment: "",
        notes: "",
      });

      setMedicalRecords((prev) => [record, ...prev]);

      toast({
        title: "Éxito",
        description: "Nuevo registro médico creado",
      });
    } catch (error) {
      console.error("Error creating record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro médico",
        type: "error",
      });
    }
  };

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

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
              <AvatarFallback>DG</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Dr. {user?.name}</p>
              <p className="text-sm text-gray-500">Médico</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
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
                  <Input
                    placeholder="Buscar paciente"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Cargando pacientes...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className={`p-3 rounded-lg cursor-pointer ${
                            selectedPatient === patient.id
                              ? "bg-teal-50 border-teal-200 border"
                              : "hover:bg-gray-50 border"
                          }`}
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
                                {patient.age
                                  ? `${patient.age} años`
                                  : "Edad no especificada"}{" "}
                                - {patient.condition}
                              </p>
                              {patient.lastVisit && (
                                <p className="text-xs text-gray-400">
                                  Última visita:{" "}
                                  {new Date(
                                    patient.lastVisit
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm
                          ? "No se encontraron pacientes"
                          : "No hay pacientes disponibles"}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient medical history */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Historial Clínico</CardTitle>
                <CardDescription>
                  {selectedPatientData
                    ? `Paciente: ${selectedPatientData.name}`
                    : "Selecciona un paciente para ver su historial"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Registros médicos</h3>
                      <Button size="sm" onClick={handleCreateRecord}>
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
                        {loadingRecords ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Cargando registros...</span>
                          </div>
                        ) : medicalRecords.length > 0 ? (
                          medicalRecords.map((record) => (
                            <div
                              key={record.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">
                                  {new Date(
                                    record.createdAt
                                  ).toLocaleDateString()}
                                </h4>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid gap-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Diagnóstico:
                                  </p>
                                  <p>{record.diagnosis}</p>
                                </div>
                                {record.treatment && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Tratamiento:
                                    </p>
                                    <p>{record.treatment}</p>
                                  </div>
                                )}
                                {record.notes && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Notas:
                                    </p>
                                    <p className="text-sm">{record.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No hay registros médicos disponibles
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="prescriptions">
                        <div className="space-y-4">
                          {medicalRecords.some(
                            (record) =>
                              record.prescriptions &&
                              record.prescriptions.length > 0
                          ) ? (
                            medicalRecords.map((record) =>
                              record.prescriptions?.map((prescription) => (
                                <div
                                  key={prescription.id}
                                  className="border rounded-lg p-4"
                                >
                                  <h4 className="font-medium">
                                    {prescription.medication}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Dosis: {prescription.dosage} - Frecuencia:{" "}
                                    {prescription.frequency}
                                  </p>
                                  {prescription.duration && (
                                    <p className="text-sm text-gray-600">
                                      Duración: {prescription.duration}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">
                                    Recetado:{" "}
                                    {new Date(
                                      prescription.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No hay recetas registradas
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="tests">
                        <div className="space-y-4">
                          {medicalRecords.some(
                            (record) => record.tests && record.tests.length > 0
                          ) ? (
                            medicalRecords.map((record) =>
                              record.tests?.map((test) => (
                                <div
                                  key={test.id}
                                  className="border rounded-lg p-4"
                                >
                                  <h4 className="font-medium">
                                    {test.testName}
                                  </h4>
                                  {test.testDate && (
                                    <p className="text-sm text-gray-600">
                                      Fecha:{" "}
                                      {new Date(
                                        test.testDate
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                  {test.results && (
                                    <p className="text-sm text-gray-600">
                                      Resultados: {test.results}
                                    </p>
                                  )}
                                  {test.notes && (
                                    <p className="text-sm text-gray-600">
                                      Notas: {test.notes}
                                    </p>
                                  )}
                                </div>
                              ))
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No hay exámenes registrados
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Agregar Nota</h3>
                      {loadingNotes ? (
                        <div className="flex items-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Cargando notas...</span>
                        </div>
                      ) : (
                        <>
                          <Textarea
                            placeholder="Escribir notas sobre el paciente..."
                            className="min-h-[100px]"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                          />
                          <Button
                            className="mt-2"
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                          >
                            Guardar Nota
                          </Button>

                          {/* Display existing notes */}
                          {patientNotes.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">
                                Notas anteriores
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {patientNotes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="bg-gray-50 p-2 rounded text-sm"
                                  >
                                    <p>{note.note}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(
                                        note.createdAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-1">
                      No hay paciente seleccionado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Selecciona un paciente de la lista para ver su historial
                      clínico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
