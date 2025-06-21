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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Pill,
  TestTube,
  StickyNote,
  Download,
  Eye,
  FileText,
} from "lucide-react";
import { patientHistoryApi } from "@/lib/api-medical-records";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/ui/sidebar";

import jsPDF from "jspdf";
// import "jspdf-autotable";
import { useToast } from "@/components/ui/toast-context";

interface HistorySummary {
  consultations: number;
  prescriptions: number;
  tests: number;
  notes: number;
}

interface Consultation {
  id: string | number;
  patient_id: string | number;
  doctor_id: string | number;
  doctor_name?: string;
  doctor_specialty?: string;
  date: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  created_at?: string;
}

interface Prescription {
  id: string | number;
  medical_record_id: string | number;
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  created_at: string;
  doctor_id?: string | number;
  doctor_name?: string;
  doctor_specialty?: string;
}

interface MedicalTest {
  id: string | number;
  medical_record_id: string | number;
  test_name: string;
  test_date: string;
  results?: string;
  notes?: string;
  created_at?: string;
  doctor_id?: string | number;
  doctor_name?: string;
  doctor_specialty?: string;
}

interface PatientNote {
  id: string | number;
  patient_id: string | number;
  doctor_id: string | number;
  doctor_name?: string;
  doctor_specialty?: string;
  note: string;
  created_at: string;
  type?: string;
}

export default function PatientHistoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("records");
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});

  // Helper function to get doctor name
  const getDoctorName = (item: any): string => {
    if (item.doctor_name) {
      return `${item.doctor_name}${
        item.doctor_specialty ? ` - ${item.doctor_specialty}` : ""
      }`;
    }
    if (item.doctor_id) {
      return `Dr. Médico ${item.doctor_id}`;
    }
    return "Doctor no especificado";
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

  // Function to generate PDF
  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(20, 184, 166); // Teal color
      doc.text("Cronos Health", margin, yPosition);

      yPosition += 10;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Historial Médico Completo", margin, yPosition);

      yPosition += 8;
      doc.setFontSize(12);
      doc.text(`Paciente: ${user?.name || "Usuario"}`, margin, yPosition);

      yPosition += 6;
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`,
        margin,
        yPosition
      );

      yPosition += 15;

      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Resumen del Historial", margin, yPosition);
      yPosition += 10;

      const summaryData = [
        ["Consultas", summary.consultations.toString()],
        ["Recetas", summary.prescriptions.toString()],
        ["Exámenes", summary.tests.toString()],
        ["Notas", summary.notes.toString()],
      ];
      (doc as any).autoTable({
        startY: yPosition,
        head: [["Tipo", "Cantidad"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [20, 184, 166] },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // Load all data if not loaded
      let allConsultations = consultations;
      let allPrescriptions = prescriptions;
      let allTests = tests;
      let allNotes = notes;

      if (allConsultations.length === 0) {
        allConsultations = (await patientHistoryApi.getConsultations()) || [];
      }
      if (allPrescriptions.length === 0) {
        allPrescriptions = (await patientHistoryApi.getPrescriptions()) || [];
      }
      if (allTests.length === 0) {
        allTests = (await patientHistoryApi.getTests()) || [];
      }
      if (allNotes.length === 0) {
        allNotes = (await patientHistoryApi.getNotes()) || [];
      }

      // Consultations section
      if (allConsultations.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.text("Consultas Médicas", margin, yPosition);
        yPosition += 10;

        const consultationsData = allConsultations.map((consultation) => [
          formatDate(consultation.date),
          getDoctorName(consultation),
          consultation.diagnosis,
          consultation.treatment || "N/A",
        ]);
        (doc as any).autoTable({
          startY: yPosition,
          head: [["Fecha", "Médico", "Diagnóstico", "Tratamiento"]],
          body: consultationsData,
          theme: "grid",
          headStyles: { fillColor: [20, 184, 166] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 40 },
            2: { cellWidth: 50 },
            3: { cellWidth: 55 },
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Prescriptions section
      if (allPrescriptions.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.text("Recetas Médicas", margin, yPosition);
        yPosition += 10;

        const prescriptionsData = allPrescriptions.map((prescription) => [
          prescription.medication,
          prescription.dosage,
          prescription.frequency,
          prescription.duration || "N/A",
          getDoctorName(prescription),
          formatDate(prescription.created_at),
        ]);
        (doc as any).autoTable({
          startY: yPosition,
          head: [
            [
              "Medicamento",
              "Dosis",
              "Frecuencia",
              "Duración",
              "Médico",
              "Fecha",
            ],
          ],
          body: prescriptionsData,
          theme: "grid",
          headStyles: { fillColor: [20, 184, 166] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 20 },
            2: { cellWidth: 25 },
            3: { cellWidth: 20 },
            4: { cellWidth: 35 },
            5: { cellWidth: 25 },
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Tests section
      if (allTests.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.text("Exámenes Médicos", margin, yPosition);
        yPosition += 10;

        const testsData = allTests.map((test) => [
          test.test_name,
          formatDate(test.test_date),
          test.results || "Pendiente",
          getDoctorName(test),
        ]);
        (doc as any).autoTable({
          startY: yPosition,
          head: [["Examen", "Fecha", "Resultados", "Médico"]],
          body: testsData,
          theme: "grid",
          headStyles: { fillColor: [20, 184, 166] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 50 },
            3: { cellWidth: 40 },
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Notes section
      if (allNotes.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.text("Notas Médicas", margin, yPosition);
        yPosition += 10;

        const notesData = allNotes.map((note) => [
          formatDate(note.created_at, true),
          getDoctorName(note),
          note.note.length > 100
            ? note.note.substring(0, 100) + "..."
            : note.note,
        ]);
        (doc as any).autoTable({
          startY: yPosition,
          head: [["Fecha", "Médico", "Nota"]],
          body: notesData,
          theme: "grid",
          headStyles: { fillColor: [20, 184, 166] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 40 },
            2: { cellWidth: 80 },
          },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${pageCount} - Generado por Cronos Health`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      const fileName = `historial-medico-${
        user?.name?.replace(/\s+/g, "-").toLowerCase() || "paciente"
      }-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Generado",
        description: "El historial médico se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF del historial médico",
        type: "error",
      });
    }
  };

  // Load initial data (summary)
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const summaryData = await patientHistoryApi.getSummary();
        setSummary(
          summaryData || {
            consultations: 0,
            prescriptions: 0,
            tests: 0,
            notes: 0,
          }
        );
      } catch (error) {
        console.error("Error loading summary:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el resumen del historial",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, toast]);

  // Load data based on active tab
  useEffect(() => {
    const loadTabData = async () => {
      if (loading || !user) return;

      try {
        setTabLoading((prev) => ({ ...prev, [activeTab]: true }));

        switch (activeTab) {
          case "records":
            if (consultations.length === 0) {
              const consultationsData =
                await patientHistoryApi.getConsultations();
              setConsultations(consultationsData || []);
            }
            break;

          case "prescriptions":
            if (prescriptions.length === 0) {
              const prescriptionsData =
                await patientHistoryApi.getPrescriptions();
              setPrescriptions(prescriptionsData || []);
            }
            break;

          case "tests":
            if (tests.length === 0) {
              const testsData = await patientHistoryApi.getTests();
              setTests(testsData || []);
            }
            break;

          case "notes":
            if (notes.length === 0) {
              const notesData = await patientHistoryApi.getNotes();
              setNotes(notesData || []);
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
    user,
    consultations.length,
    prescriptions.length,
    tests.length,
    notes.length,
    toast,
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Use shared sidebar */}
      <Sidebar currentPage="history" />

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-semibold">Mi Historial Médico</h1>
            <Button variant="outline" size="sm" onClick={generatePDF}>
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
                                  {getDoctorName(consultation)}
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
                              {getDoctorName(prescription)}
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
                              {getDoctorName(test)}
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
                                  {getDoctorName(note)}
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