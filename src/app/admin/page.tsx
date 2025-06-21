"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Users, BarChart3, FileText, Bell } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";

export default function AdminPage() {
	// Mock statistics data
	const stats = [
		{ title: "Total Pacientes", value: "1,248", change: "+12%" },
		{ title: "Total Médicos", value: "36", change: "+2%" },
		{ title: "Turnos Mensuales", value: "856", change: "+5%" },
		{ title: "Tasa de Asistencia", value: "92%", change: "+3%" },
	];

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar currentPage="admin" />

			{/* Main content */}
			<div className="flex-1 md:ml-64">
				<header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
					<h1 className="text-xl font-semibold">
						Panel de Administración
					</h1>
				</header>
				<main className="p-4 md:p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
						{stats.map((stat, index) => (
							<Card key={index}>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">
										{stat.title}
									</CardTitle>
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
										className="h-4 w-4 text-gray-500"
									>
										<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
									</svg>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{stat.value}
									</div>
									<p className="text-xs text-green-500">
										{stat.change} desde el mes pasado
									</p>
								</CardContent>
							</Card>
						))}
					</div>

					<Tabs defaultValue="overview">
						<TabsList className="mb-4">
							<TabsTrigger value="overview">Resumen</TabsTrigger>
							<TabsTrigger value="analytics">
								Analíticas
							</TabsTrigger>
							<TabsTrigger value="reports">Reportes</TabsTrigger>
						</TabsList>
						<TabsContent value="overview">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<Card className="md:col-span-2">
									<CardHeader>
										<CardTitle>
											Actividad Reciente
										</CardTitle>
										<CardDescription>
											Últimas acciones en el sistema
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="flex items-start space-x-4">
												<div className="bg-teal-100 p-2 rounded-full">
													<CalendarIcon className="h-5 w-5 text-teal-600" />
												</div>
												<div>
													<p className="font-medium">
														Nuevo turno agendado
													</p>
													<p className="text-sm text-gray-500">
														Paciente: Ana Martínez -
														Dr. Gabriel Méndez
													</p>
													<p className="text-xs text-gray-400">
														Hace 10 minutos
													</p>
												</div>
											</div>
											<div className="flex items-start space-x-4">
												<div className="bg-blue-100 p-2 rounded-full">
													<Users className="h-5 w-5 text-blue-600" />
												</div>
												<div>
													<p className="font-medium">
														Nuevo paciente
														registrado
													</p>
													<p className="text-sm text-gray-500">
														Roberto Sánchez se ha
														registrado en el sistema
													</p>
													<p className="text-xs text-gray-400">
														Hace 45 minutos
													</p>
												</div>
											</div>
											<div className="flex items-start space-x-4">
												<div className="bg-amber-100 p-2 rounded-full">
													<Bell className="h-5 w-5 text-amber-600" />
												</div>
												<div>
													<p className="font-medium">
														Recordatorio enviado
													</p>
													<p className="text-sm text-gray-500">
														Recordatorio de cita
														enviado a 15 pacientes
													</p>
													<p className="text-xs text-gray-400">
														Hace 1 hora
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<CardTitle>
											Distribución de Turnos
										</CardTitle>
										<CardDescription>
											Por especialidad médica
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div>
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-medium">
														Cardiología
													</p>
													<p className="text-sm font-medium">
														28%
													</p>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-teal-600 h-2 rounded-full"
														style={{ width: "28%" }}
													></div>
												</div>
											</div>
											<div>
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-medium">
														Dermatología
													</p>
													<p className="text-sm font-medium">
														22%
													</p>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-teal-600 h-2 rounded-full"
														style={{ width: "22%" }}
													></div>
												</div>
											</div>
											<div>
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-medium">
														Pediatría
													</p>
													<p className="text-sm font-medium">
														18%
													</p>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-teal-600 h-2 rounded-full"
														style={{ width: "18%" }}
													></div>
												</div>
											</div>
											<div>
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-medium">
														Traumatología
													</p>
													<p className="text-sm font-medium">
														15%
													</p>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-teal-600 h-2 rounded-full"
														style={{ width: "15%" }}
													></div>
												</div>
											</div>
											<div>
												<div className="flex items-center justify-between mb-1">
													<p className="text-sm font-medium">
														Otras
													</p>
													<p className="text-sm font-medium">
														17%
													</p>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-teal-600 h-2 rounded-full"
														style={{ width: "17%" }}
													></div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
						<TabsContent value="analytics">
							<Card>
								<CardHeader>
									<CardTitle>Analíticas</CardTitle>
									<CardDescription>
										Métricas detalladas del sistema
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-10">
										<BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
										<h3 className="text-lg font-medium mb-2">
											Analíticas detalladas
										</h3>
										<p className="text-gray-500 mb-4">
											Las analíticas detalladas estarán
											disponibles próximamente
										</p>
										<Button variant="outline">
											Ver Documentación
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="reports">
							<Card>
								<CardHeader>
									<CardTitle>Reportes</CardTitle>
									<CardDescription>
										Generación de informes personalizados
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-10">
										<FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
										<h3 className="text-lg font-medium mb-2">
											Generador de Reportes
										</h3>
										<p className="text-gray-500 mb-4">
											Crea informes personalizados según
											tus necesidades
										</p>
										<Button>Crear Reporte</Button>
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
