"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Star, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import {
	surveyApi,
	type SurveySubmission,
	type Survey,
} from "@/services/survey-api";
import { ProtectedRoute } from "@/components/protected-route";

function SurveyPageContent() {
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	// Get appointment data from URL parameters
	const appointmentId = searchParams.get("appointmentId");
	const doctorName = searchParams.get("doctorName");
	const specialty = searchParams.get("specialty");
	const appointmentDate = searchParams.get("date");

	// Form state
	const [step, setStep] = useState(1);
	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<SurveySubmission>({
		appointmentId: appointmentId ? parseInt(appointmentId) : undefined,
		appointmentEaseRating: 4,
		punctualityRating: 3,
		medicalStaffRating: 5,
		platformRating: 4,
		wouldRecommend: "yes",
		additionalComments: "",
	});

	// Previous surveys state
	const [previousSurveys, setPreviousSurveys] = useState<Survey[]>([]);
	const [loadingSurveys, setLoadingSurveys] = useState(true);
	const [activeTab, setActiveTab] = useState("new-survey");

	// Redirect non-patients
	useEffect(() => {
		if (user && user.user_type !== "patient") {
			toast({
				title: "Acceso Denegado",
				description:
					"Solo los pacientes pueden acceder a las encuestas",
				type: "error",
			});
			router.push("/dashboard");
		}
	}, [user, router, toast]);

	// Load previous surveys
	useEffect(() => {
		const loadSurveys = async () => {
			if (user?.user_type !== "patient") return;

			try {
				setLoadingSurveys(true);
				const surveys = await surveyApi.getMySurveys();
				setPreviousSurveys(surveys);
			} catch (error) {
				console.error("Error loading surveys:", error);
				toast({
					title: "Error",
					description:
						"No se pudieron cargar las encuestas anteriores",
					type: "error",
				});
			} finally {
				setLoadingSurveys(false);
			}
		};

		loadSurveys();
	}, [user, toast]);
	const handleInputChange = (
		field: keyof SurveySubmission,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSubmitting) return;

		try {
			setIsSubmitting(true);

			await surveyApi.submitSurvey(formData);

			setSubmitted(true);

			// Refresh previous surveys
			const surveys = await surveyApi.getMySurveys();
			setPreviousSurveys(surveys);

			toast({
				title: "Encuesta enviada",
				description:
					"Gracias por tu opinión. Nos ayuda a mejorar nuestros servicios.",
				type: "success",
			});
		} catch (error: unknown) {
			console.error("Error submitting survey:", error);

			let errorMessage = "No se pudo enviar la encuesta";
			if (error && typeof error === "object" && "response" in error) {
				const err = error as {
					response?: { data?: { message?: string } };
				};
				if (err.response?.data?.message) {
					errorMessage = err.response.data.message;
				}
			}

			toast({
				title: "Error",
				description: errorMessage,
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleNext = () => {
		setStep(step + 1);
	};

	const handlePrevious = () => {
		setStep(step - 1);
	};

	const resetForm = () => {
		setSubmitted(false);
		setStep(1);
		setFormData({
			appointmentEaseRating: 4,
			punctualityRating: 3,
			medicalStaffRating: 5,
			platformRating: 4,
			wouldRecommend: "yes",
			additionalComments: "",
		});
	};

	// Rating component
	const RatingScale = ({
		value,
		onChange,
		label,
		lowLabel,
		highLabel,
	}: {
		value: number;
		onChange: (value: number) => void;
		label: string;
		lowLabel: string;
		highLabel: string;
	}) => (
		<div className="space-y-4">
			<h3 className="font-medium mb-2">{label}</h3>
			<RadioGroup
				value={value.toString()}
				onValueChange={(val) => onChange(parseInt(val))}
			>
				<div className="flex justify-between max-w-md">
					{[1, 2, 3, 4, 5].map((rating) => (
						<div
							key={rating}
							className="flex flex-col items-center"
						>
							<RadioGroupItem
								value={rating.toString()}
								id={`${label}-${rating}`}
							/>
							<Label
								htmlFor={`${label}-${rating}`}
								className="mt-1"
							>
								{rating}
							</Label>
							{rating === 1 && (
								<span className="text-xs text-gray-500 mt-1">
									{lowLabel}
								</span>
							)}
							{rating === 5 && (
								<span className="text-xs text-gray-500 mt-1">
									{highLabel}
								</span>
							)}
						</div>
					))}
				</div>
			</RadioGroup>
		</div>
	);

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Get recommendation badge
	const getRecommendationBadge = (recommendation: string) => {
		switch (recommendation) {
			case "yes":
				return (
					<Badge variant="default" className="bg-green-500">
						Sí
					</Badge>
				);
			case "no":
				return <Badge variant="destructive">No</Badge>;
			case "maybe":
				return <Badge variant="secondary">Tal vez</Badge>;
			default:
				return <Badge variant="outline">{recommendation}</Badge>;
		}
	};

	if (!user || user.user_type !== "patient") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-center mb-6">
					<Link
						href="/dashboard"
						className="flex items-center space-x-2"
					>
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

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="new-survey">
							Nueva Encuesta
						</TabsTrigger>
						<TabsTrigger value="my-surveys">
							Mis Encuestas
						</TabsTrigger>
					</TabsList>

					<TabsContent value="new-survey">
						{" "}
						<Card className="w-full max-w-lg mx-auto">
							<CardHeader className="space-y-1">
								<CardTitle className="text-2xl text-center">
									Encuesta de Satisfacción
								</CardTitle>
								<CardDescription className="text-center">
									Su opinión nos ayuda a mejorar nuestros
									servicios
								</CardDescription>
								{/* Show appointment information if available */}
								{appointmentId && doctorName && (
									<div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
										<h4 className="font-medium text-teal-800 mb-2">
											Cita Evaluada:
										</h4>
										<div className="text-sm text-teal-700 space-y-1">
											<p>
												<strong>Médico:</strong>{" "}
												{doctorName}
											</p>
											{specialty && (
												<p>
													<strong>
														Especialidad:
													</strong>{" "}
													{specialty}
												</p>
											)}
											{appointmentDate && (
												<p>
													<strong>Fecha:</strong>{" "}
													{appointmentDate}
												</p>
											)}
										</div>
									</div>
								)}
							</CardHeader>
							<CardContent>
								{!submitted ? (
									<form onSubmit={handleSubmit}>
										{step === 1 && (
											<div className="space-y-6">
												<RatingScale
													value={
														formData.appointmentEaseRating
													}
													onChange={(value) =>
														handleInputChange(
															"appointmentEaseRating",
															value
														)
													}
													label="1. ¿Cómo calificaría la facilidad para agendar su cita?"
													lowLabel="Muy difícil"
													highLabel="Muy fácil"
												/>

												<RatingScale
													value={
														formData.punctualityRating
													}
													onChange={(value) =>
														handleInputChange(
															"punctualityRating",
															value
														)
													}
													label="2. ¿Cómo calificaría la puntualidad de su atención?"
													lowLabel="Muy mala"
													highLabel="Excelente"
												/>

												<RatingScale
													value={
														formData.medicalStaffRating
													}
													onChange={(value) =>
														handleInputChange(
															"medicalStaffRating",
															value
														)
													}
													label="3. ¿Cómo calificaría la atención del personal médico?"
													lowLabel="Muy mala"
													highLabel="Excelente"
												/>
											</div>
										)}

										{step === 2 && (
											<div className="space-y-6">
												<RatingScale
													value={
														formData.platformRating
													}
													onChange={(value) =>
														handleInputChange(
															"platformRating",
															value
														)
													}
													label="4. ¿Cómo calificaría la plataforma de Cronos Health?"
													lowLabel="Muy mala"
													highLabel="Excelente"
												/>

												<div>
													<h3 className="font-medium mb-2">
														5. ¿Recomendaría
														nuestros servicios a
														otras personas?
													</h3>
													<RadioGroup
														value={
															formData.wouldRecommend
														}
														onValueChange={(
															value
														) =>
															handleInputChange(
																"wouldRecommend",
																value as
																	| "yes"
																	| "no"
																	| "maybe"
															)
														}
													>
														<div className="flex space-x-4">
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="yes"
																	id="yes"
																/>
																<Label htmlFor="yes">
																	Sí
																</Label>
															</div>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="no"
																	id="no"
																/>
																<Label htmlFor="no">
																	No
																</Label>
															</div>
															<div className="flex items-center space-x-2">
																<RadioGroupItem
																	value="maybe"
																	id="maybe"
																/>
																<Label htmlFor="maybe">
																	Tal vez
																</Label>
															</div>
														</div>
													</RadioGroup>
												</div>

												<div>
													<h3 className="font-medium mb-2">
														6. Comentarios
														adicionales o
														sugerencias
													</h3>
													<Textarea
														placeholder="Escriba sus comentarios aquí..."
														className="min-h-[100px]"
														value={
															formData.additionalComments
														}
														onChange={(e) =>
															handleInputChange(
																"additionalComments",
																e.target.value
															)
														}
													/>
												</div>
											</div>
										)}

										<div className="flex justify-between mt-6">
											{step > 1 && (
												<Button
													type="button"
													variant="outline"
													onClick={handlePrevious}
													disabled={isSubmitting}
												>
													Anterior
												</Button>
											)}
											{step < 2 ? (
												<Button
													type="button"
													className="ml-auto"
													onClick={handleNext}
												>
													Siguiente
												</Button>
											) : (
												<Button
													type="submit"
													className="ml-auto"
													disabled={isSubmitting}
												>
													{isSubmitting ? (
														<>
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															Enviando...
														</>
													) : (
														"Enviar"
													)}
												</Button>
											)}
										</div>
									</form>
								) : (
									<div className="flex flex-col items-center justify-center py-6 text-center">
										<div className="rounded-full bg-green-100 p-3 mb-4">
											<CheckCircle2 className="h-12 w-12 text-green-600" />
										</div>{" "}
										<h3 className="text-xl font-medium mb-2">
											¡Gracias por su opinión!
										</h3>
										<p className="text-gray-600 mb-4">
											{appointmentId
												? `Su evaluación de la cita${
														doctorName
															? ` con ${doctorName}`
															: ""
												  } ha sido enviada exitosamente.`
												: "Su encuesta de satisfacción ha sido enviada exitosamente."}
										</p>
										<p className="text-gray-500 mb-6">
											Sus comentarios son muy valiosos
											para nosotros y nos ayudarán a
											mejorar nuestros servicios.
										</p>
										<div className="flex space-x-3">
											<Button
												onClick={() =>
													router.push("/dashboard")
												}
											>
												Volver al Dashboard
											</Button>
											<Button
												variant="outline"
												onClick={resetForm}
											>
												Nueva Encuesta
											</Button>
										</div>
									</div>
								)}
							</CardContent>
							<CardFooter className="flex justify-center border-t pt-4">
								<p className="text-xs text-gray-500">
									Cronos Health © 2025. Todos los derechos
									reservados.
								</p>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="my-surveys">
						<Card>
							<CardHeader>
								<CardTitle>Mis Encuestas</CardTitle>
								<CardDescription>
									Historial de encuestas de satisfacción
									enviadas
								</CardDescription>
							</CardHeader>
							<CardContent>
								{loadingSurveys ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-8 w-8 animate-spin mr-3" />
										<span>Cargando encuestas...</span>
									</div>
								) : previousSurveys.length > 0 ? (
									<div className="space-y-4">
										{previousSurveys.map((survey) => (
											<div
												key={survey.id}
												className="border rounded-lg p-4 hover:bg-gray-50"
											>
												<div className="flex justify-between items-start mb-3">
													<div>
														<div className="flex items-center space-x-2 mb-1">
															<Calendar className="h-4 w-4 text-gray-500" />
															<span className="font-medium">
																{formatDate(
																	survey.created_at
																)}
															</span>
														</div>
														{survey.doctor_name && (
															<div className="flex items-center space-x-2 text-sm text-gray-600">
																<User className="h-4 w-4" />
																<span>
																	{
																		survey.doctor_name
																	}
																	{survey.doctor_specialty &&
																		` - ${survey.doctor_specialty}`}
																</span>
															</div>
														)}
													</div>
													{getRecommendationBadge(
														survey.would_recommend
													)}
												</div>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
													<div className="text-center">
														<div className="flex items-center justify-center mb-1">
															<Star className="h-4 w-4 text-yellow-500 mr-1" />
															<span className="font-medium">
																{
																	survey.appointment_ease_rating
																}
															</span>
														</div>
														<p className="text-xs text-gray-500">
															Facilidad de agenda
														</p>
													</div>
													<div className="text-center">
														<div className="flex items-center justify-center mb-1">
															<Star className="h-4 w-4 text-yellow-500 mr-1" />
															<span className="font-medium">
																{
																	survey.punctuality_rating
																}
															</span>
														</div>
														<p className="text-xs text-gray-500">
															Puntualidad
														</p>
													</div>
													<div className="text-center">
														<div className="flex items-center justify-center mb-1">
															<Star className="h-4 w-4 text-yellow-500 mr-1" />
															<span className="font-medium">
																{
																	survey.medical_staff_rating
																}
															</span>
														</div>
														<p className="text-xs text-gray-500">
															Personal médico
														</p>
													</div>
													<div className="text-center">
														<div className="flex items-center justify-center mb-1">
															<Star className="h-4 w-4 text-yellow-500 mr-1" />
															<span className="font-medium">
																{
																	survey.platform_rating
																}
															</span>
														</div>
														<p className="text-xs text-gray-500">
															Plataforma
														</p>
													</div>
												</div>

												{survey.additional_comments && (
													<div className="bg-gray-50 p-3 rounded-md">
														<p className="text-sm text-gray-700">
															{
																survey.additional_comments
															}
														</p>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
										<h3 className="font-medium text-gray-600 mb-2">
											No has enviado encuestas aún
										</h3>
										<p className="text-gray-500 mb-4">
											Comparte tu opinión para ayudarnos a
											mejorar nuestros servicios
										</p>
										<Button
											onClick={() =>
												setActiveTab("new-survey")
											}
										>
											Crear Primera Encuesta
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default function SurveyPage() {
	return (
		<ProtectedRoute requireAuth={true} allowedUserTypes={["patient"]}>
			<SurveyPageContent />
		</ProtectedRoute>
	);
}
