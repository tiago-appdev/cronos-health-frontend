"use client";

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { surveyApi } from "@/services/survey-api";

interface SurveyContextType {
	pendingSurveys: number;
	checkPendingSurveys: () => Promise<void>;
	showSurveyToast: (appointmentData: {
		appointmentId: number;
		doctorName: string;
		specialty: string;
		appointmentDate: string;
	}) => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const useSurvey = () => {
	const context = useContext(SurveyContext);
	if (!context) {
		throw new Error("useSurvey must be used within a SurveyProvider");
	}
	return context;
};

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useAuth();
	const { toast } = useToast();
	const [pendingSurveys, setPendingSurveys] = useState(0);

	const checkPendingSurveys = useCallback(async () => {
		if (user?.user_type !== "patient") return;

		try {
			const surveys = await surveyApi.getPendingSurveys();
			const dismissedFromStorage = JSON.parse(
				localStorage.getItem("dismissedSurveys") || "[]"
			);

			const filteredSurveys = surveys.filter(
				(survey) => !dismissedFromStorage.includes(survey.appointmentId)
			);

			setPendingSurveys(filteredSurveys.length);
		} catch (error) {
			console.error("Error checking pending surveys:", error);
		}
	}, [user?.user_type]);
	const showSurveyToast = (appointmentData: {
		appointmentId: number;
		doctorName: string;
		specialty: string;
		appointmentDate: string;
	}) => {
		toast({
			title: "¡Cita Completada! 🎉",
			description: `Su cita con ${appointmentData.doctorName} ha finalizado. Puede evaluar la atención recibida desde su panel de citas completadas.`,
			type: "success",
		});

		// Also trigger a check for pending surveys
		setTimeout(checkPendingSurveys, 1000);
	};
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (user?.user_type === "patient") {
			checkPendingSurveys();

			// Check for pending surveys every 5 minutes
			interval = setInterval(checkPendingSurveys, 5 * 60 * 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [user?.user_type, checkPendingSurveys]);

	return (
		<SurveyContext.Provider
			value={{
				pendingSurveys,
				checkPendingSurveys,
				showSurveyToast,
			}}
		>
			{children}
		</SurveyContext.Provider>
	);
};
