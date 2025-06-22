import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { surveyApi } from "@/services/survey-api";
import { useRouter } from "next/navigation";

interface PendingSurvey {
	appointmentId: number;
	doctorName: string;
	specialty: string;
	appointmentDate: string;
	completedAt: string;
}

export const SurveyNotification = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const router = useRouter();
	const [pendingSurveys, setPendingSurveys] = useState<PendingSurvey[]>([]);
	const [dismissed, setDismissed] = useState<Set<number>>(new Set());
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user?.user_type === "patient") {
			checkPendingSurveys();
		}
	}, [user]);

	const checkPendingSurveys = async () => {
		try {
			setLoading(true);
			const surveys = await surveyApi.getPendingSurveys();

			// Filter out dismissed surveys
			const dismissedFromStorage = JSON.parse(
				localStorage.getItem("dismissedSurveys") || "[]"
			);

			const filteredSurveys = surveys.filter(
				(survey) => !dismissedFromStorage.includes(survey.appointmentId)
			);

			setPendingSurveys(filteredSurveys);
			setDismissed(new Set(dismissedFromStorage));
		} catch (error) {
			console.error("Error checking pending surveys:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleTakeSurvey = (survey: PendingSurvey) => {
		const surveyUrl = `/survey?appointmentId=${
			survey.appointmentId
		}&doctorName=${encodeURIComponent(
			survey.doctorName
		)}&specialty=${encodeURIComponent(
			survey.specialty
		)}&date=${encodeURIComponent(survey.appointmentDate)}`;
		router.push(surveyUrl);
	};

	const handleDismiss = (appointmentId: number) => {
		const newDismissed = new Set(dismissed);
		newDismissed.add(appointmentId);
		setDismissed(newDismissed);

		// Save to localStorage
		const dismissedArray = Array.from(newDismissed);
		localStorage.setItem(
			"dismissedSurveys",
			JSON.stringify(dismissedArray)
		);

		// Remove from pending surveys
		setPendingSurveys((prev) =>
			prev.filter((s) => s.appointmentId !== appointmentId)
		);

		toast({
			title: "Notificación ocultada",
			description: "Puede evaluar la cita desde su historial de citas",
			type: "info",
		});
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (
		loading ||
		pendingSurveys.length === 0 ||
		user?.user_type !== "patient"
	) {
		return null;
	}

	return (
		<div className="space-y-4 mb-6">
			{pendingSurveys.map((survey) => (
				<Card
					key={survey.appointmentId}
					className="border-l-4 border-l-teal-500 bg-teal-50"
				>
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between">
							<div className="flex items-center space-x-2">
								<Star className="h-5 w-5 text-teal-600" />
								<CardTitle className="text-lg text-teal-800">
									Evaluación de Cita Pendiente
								</CardTitle>
								<Badge
									variant="secondary"
									className="bg-teal-100 text-teal-700"
								>
									Nuevo
								</Badge>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									handleDismiss(survey.appointmentId)
								}
								className="text-teal-600 hover:text-teal-700"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
						<CardDescription className="text-teal-700">
							Su cita con {survey.doctorName} ha sido completada.
							¿Le gustaría evaluar la atención recibida?
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
							<div>
								<span className="font-medium text-teal-800">
									Médico:
								</span>
								<p className="text-teal-700">
									{survey.doctorName}
								</p>
							</div>
							<div>
								<span className="font-medium text-teal-800">
									Especialidad:
								</span>
								<p className="text-teal-700">
									{survey.specialty}
								</p>
							</div>
							<div>
								<span className="font-medium text-teal-800">
									Fecha:
								</span>
								<p className="text-teal-700">
									{formatDate(survey.appointmentDate)}
								</p>
							</div>
						</div>
						<div className="flex space-x-3">
							<Button
								onClick={() => handleTakeSurvey(survey)}
								className="bg-teal-600 hover:bg-teal-700"
							>
								📝 Evaluar Atención
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									handleDismiss(survey.appointmentId)
								}
								className="border-teal-300 text-teal-700 hover:bg-teal-50"
							>
								Recordar más tarde
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
