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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  User,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Loader2,
  Pill,
  TestTube,
  StickyNote,
  Download,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  patientHistoryApi,
  authApi,
  doctorsApi,
} from "@/lib/api-medical-records";
import { useToast } from "@/components/ui/toast-context";

interface HistorySummary {
  consultations: number;
  prescriptions: number;
  tests: number;
  notes: number;
}

interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  created_at?: string;
}

interface Prescription {
  id: string;
  medical_record_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  created_at: string;
  doctor_id?: string;
}

interface MedicalTest {
  id: string;
  medical_record_id: string;
  test_name: string;
  test_date: string;
  results?: string;
  notes?: string;
  created_at?: string;
  doctor_id?: string;
}

interface PatientNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  note: string;
  created_at: string;
  type?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  userType: string;
}

export default function PatientHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [summary, setSummary] = useState<HistorySummary>({
    consultations: 0,
    prescriptions: 0,
    tests: 0,
    notes: 0,
  });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [tests, setTests] = useState<MedicalTest[]>([]);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: Doctor }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("records");
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});

  // Helper function to get doctor name from cache
  const getDoctorName = (doctorId: string | number): string => {
    const doctor = doctors[doctorId.toString()];
    if (doctor) {
      return `Dr. ${doctor.name}${
        doctor.specialty ? ` - ${doctor.specialty}` : ""
      }`;
    }
    return `Dr. Médico ${doctorId}`; // Fallback while loading
  };

  // Helper function to format date safely
  const formatDate = (
    dateString: string | undefined,
    includeTime = false
  ): string => {
    if (!dateString) return "Fecha no disponible";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha no válida";
      }

      if (includeTime) {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Fecha no válida";
    }
  };

  // Function to load doctor information
  const loadDoctorInfo = async (doctorIds: string[]) => {
    try {
      // Filter out IDs we already have
      const uniqueIds = [...new Set(doctorIds)].filter((id) => !doctors[id]);

      if (uniqueIds.length === 0) return;

      console.log("Loading doctor info for IDs:", uniqueIds);

      // Try to get doctors by batch first, fallback to individual calls
      try {
        const doctorsData = await doctorsApi.getDoctorsByIds(uniqueIds);
        const doctorsMap = { ...doctors };

        doctorsData.forEach((doctor: Doctor) => {
          doctorsMap[doctor.id] = doctor;
        });

        setDoctors(doctorsMap);
      } catch (batchError) {
        console.log(
          "Batch request failed, trying individual requests:",
          batchError
        );

        // Fallback: individual requests
        const doctorsMap = { ...doctors };

        await Promise.allSettled(
          uniqueIds.map(async (doctorId) => {
            try {
              const doctor = await doctorsApi.getDoctorById(doctorId);
              doctorsMap[doctorId] = doctor;
            } catch (error) {
              console.error(`Failed to load doctor ${doctorId}:`, error);
              // Create a placeholder doctor entry
              doctorsMap[doctorId] = {
                id: doctorId,
                name: `Médico ${doctorId}`,
                specialty: "Especialidad no disponible",
              };
            }
          })
        );

        setDoctors(doctorsMap);
      }
    } catch (error) {
      console.error("Error loading doctor information:", error);

      // Create placeholder entries for all requested IDs
      const doctorsMap = { ...doctors };
      doctorIds.forEach((doctorId) => {
        if (!doctorsMap[doctorId]) {
          doctorsMap[doctorId] = {
            id: doctorId,
            name: `Médico ${doctorId}`,
            specialty: "Especialidad no disponible",
          };
        }
      });
      setDoctors(doctorsMap);
    }
  };

  // Load current user and summary
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Get current user and summary in parallel
        const [user, summaryData] = await Promise.all([
          authApi.getCurrentUser(),
          patientHistoryApi.getSummary(),
        ]);

        setCurrentUser(user);
        setSummary(summaryData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos iniciales",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // Load data based on active tab
  useEffect(() => {
    const loadTabData = async () => {
      if (loading) return; // Don't load tab data if still loading initial data

      try {
        setTabLoading((prev) => ({ ...prev, [activeTab]: true }));

        switch (activeTab) {
          case "records":
            if (consultations.length === 0) {
              const consultationsData =
                await patientHistoryApi.getConsultations();
              console.log("Consultations data:", consultationsData);
              setConsultations(consultationsData);

              // Load doctor information for consultations
              const doctorIds = consultationsData.map((c: Consultation) =>
                c.doctor_id.toString()
              );
              await loadDoctorInfo(doctorIds);
            }
            break;
          case "prescriptions":
            if (prescriptions.length === 0) {
              const prescriptionsData =
                await patientHistoryApi.getPrescriptions();
              console.log("Prescriptions data:", prescriptionsData);
              setPrescriptions(prescriptionsData);

              // Load doctor information for prescriptions (if available)
              const doctorIds = prescriptionsData
                .filter((p: Prescription) => p.doctor_id)
                .map((p: Prescription) => p.doctor_id!.toString());
              if (doctorIds.length > 0) {
                await loadDoctorInfo(doctorIds);
              }
            }
            break;
          case "tests":
            if (tests.length === 0) {
              const testsData = await patientHistoryApi.getTests();
              console.log("Tests data:", testsData);
              setTests(testsData);

              // Load doctor information for tests (if available)
              const doctorIds = testsData
                .filter((t: MedicalTest) => t.doctor_id)
                .map((t: MedicalTest) => t.doctor_id!.toString());
              if (doctorIds.length > 0) {
                await loadDoctorInfo(doctorIds);
              }
            }
            break;
          case "notes":
            if (notes.length === 0) {
              const notesData = await patientHistoryApi.getNotes();
              console.log("Notes data:", notesData);
              setNotes(notesData);

              // Load doctor information for notes
              const doctorIds = notesData.map((n: PatientNote) =>
                n.doctor_id.toString()
              );
              await loadDoctorInfo(doctorIds);
            }
            break;
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error);
        toast({
          title: "Error",
          description: `No se pudieron cargar los datos de ${activeTab}`,
          type: "error",
        });
      } finally {
        setTabLoading((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    loadTabData();
  }, [
    activeTab,
    loading,
    consultations.length,
    prescriptions.length,
    tests.length,
    notes.length,
    toast,
  ]);

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
              <AvatarFallback>
                {currentUser?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser?.name || "Usuario"}</p>
              <p className="text-sm text-gray-500">Paciente</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
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
              className="flex items-center p-2 rounded-md bg-gray-100 text-teal-600 font-medium"
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
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-semibold">Mi Historial Médico</h1>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Cargando historial médico...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-teal-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">
                          {summary.consultations}
                        </p>
                        <p className="text-sm text-gray-500">Consultas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Pill className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">
                          {summary.prescriptions}
                        </p>
                        <p className="text-sm text-gray-500">Recetas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <TestTube className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{summary.tests}</p>
                        <p className="text-sm text-gray-500">Exámenes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <StickyNote className="h-8 w-8 text-amber-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{summary.notes}</p>
                        <p className="text-sm text-gray-500">Notas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial Médico Completo</CardTitle>
                  <CardDescription>
                    Aquí puedes ver todo tu historial médico, incluyendo
                    consultas, recetas y exámenes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="records">Consultas</TabsTrigger>
                      <TabsTrigger value="prescriptions">Recetas</TabsTrigger>
                      <TabsTrigger value="tests">Exámenes</TabsTrigger>
                      <TabsTrigger value="notes">Notas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="records" className="space-y-4 mt-6">
                      {tabLoading.records ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Cargando consultas...</span>
                        </div>
                      ) : consultations.length > 0 ? (
                        consultations.map((consultation) => (
                          <div
                            key={consultation.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {consultation.diagnosis}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatDate(consultation.date)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {getDoctorName(consultation.doctor_id)}
                                </p>
                              </div>
                              <Badge variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Consulta
                              </Badge>
                            </div>

                            {consultation.treatment && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-700 mb-1">
                                  Tratamiento:
                                </h4>
                                <p className="text-gray-600">
                                  {consultation.treatment}
                                </p>
                              </div>
                            )}

                            {consultation.notes && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-700 mb-1">
                                  Observaciones:
                                </h4>
                                <p className="text-gray-600">
                                  {consultation.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No tienes consultas médicas registradas</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent
                      value="prescriptions"
                      className="space-y-4 mt-6"
                    >
                      {tabLoading.prescriptions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Cargando recetas...</span>
                        </div>
                      ) : prescriptions.length > 0 ? (
                        prescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">
                                {prescription.medication}
                              </h3>
                              <Badge variant="outline">
                                <Pill className="h-3 w-3 mr-1" />
                                Receta
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {prescription.doctor_id
                                ? getDoctorName(prescription.doctor_id)
                                : "Doctor no especificado"}
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Dosis:</p>
                                <p className="font-medium">
                                  {prescription.dosage}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Frecuencia:
                                </p>
                                <p className="font-medium">
                                  {prescription.frequency}
                                </p>
                              </div>
                              {prescription.duration && (
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Duración:
                                  </p>
                                  <p className="font-medium">
                                    {prescription.duration}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-500">
                                  Fecha de prescripción:
                                </p>
                                <p className="font-medium">
                                  {formatDate(prescription.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No tienes recetas médicas registradas</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="tests" className="space-y-4 mt-6">
                      {tabLoading.tests ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Cargando exámenes...</span>
                        </div>
                      ) : tests.length > 0 ? (
                        tests.map((test) => (
                          <div
                            key={test.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">
                                {test.test_name}
                              </h3>
                              <Badge variant="outline">
                                <TestTube className="h-3 w-3 mr-1" />
                                Examen
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {test.doctor_id
                                ? getDoctorName(test.doctor_id)
                                : "Doctor no especificado"}
                            </p>
                            <div className="grid md:grid-cols-1 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Fecha del examen:
                                </p>
                                <p className="font-medium">
                                  {formatDate(test.test_date)}
                                </p>
                              </div>
                            </div>
                            {test.results && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-1">
                                  Resultados:
                                </p>
                                <p className="text-gray-700">{test.results}</p>
                              </div>
                            )}
                            {test.notes && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-1">
                                  Notas:
                                </p>
                                <p className="text-gray-700">{test.notes}</p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No tienes exámenes médicos registrados</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4 mt-6">
                      {tabLoading.notes ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Cargando notas...</span>
                        </div>
                      ) : notes.length > 0 ? (
                        notes.map((note) => (
                          <div
                            key={note.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {formatDate(note.created_at, true)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {getDoctorName(note.doctor_id)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {note.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {note.type}
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  <StickyNote className="h-3 w-3 mr-1" />
                                  Nota
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-700">{note.note}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No tienes notas médicas registradas</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
