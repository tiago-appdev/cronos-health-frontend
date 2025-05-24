"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarProps {
	mode?: "single" | "multiple" | "range";
	selected?: Date | Date[] | undefined;
	onSelect?: (date: Date | undefined) => void;
	disabled?: (date: Date) => boolean;
	className?: string;
	appointmentDates?: string[];
}

const monthNames = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export function Calendar({
	mode = "single",
	selected,
	onSelect,
	disabled,
	className,
	appointmentDates = [],
	...props
}: CalendarProps) {
	const [currentDate, setCurrentDate] = React.useState(new Date());

	const selectedDate = React.useMemo(() => {
		if (mode === "single" && selected instanceof Date) {
			return selected;
		}
		return undefined;
	}, [selected, mode]);

	// Get first day of the month
	const firstDayOfMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		1
	);
	const lastDayOfMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		0
	);

	// Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
	const startingDayOfWeek = firstDayOfMonth.getDay();

	// Get days in month
	const daysInMonth = lastDayOfMonth.getDate();

	// Get previous month's last days
	const prevMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() - 1,
		0
	);
	const daysInPrevMonth = prevMonth.getDate();

	// Generate calendar days
	const calendarDays = [];

	// Previous month's trailing days
	for (let i = startingDayOfWeek - 1; i >= 0; i--) {
		const day = daysInPrevMonth - i;
		const date = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() - 1,
			day
		);
		calendarDays.push({
			date,
			day,
			isCurrentMonth: false,
			isPrevMonth: true,
		});
	}

	// Current month days
	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			day
		);
		calendarDays.push({
			date,
			day,
			isCurrentMonth: true,
			isPrevMonth: false,
		});
	}

	// Next month's leading days
	const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days = 42
	for (let day = 1; day <= remainingDays; day++) {
		const date = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			day
		);
		calendarDays.push({
			date,
			day,
			isCurrentMonth: false,
			isPrevMonth: false,
		});
	}

	const goToPreviousMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
		);
	};

	const goToNextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
		);
	};

	const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
		if (!isCurrentMonth) return;
		if (disabled && disabled(date)) return;
		if (onSelect) {
			onSelect(date);
		}
	};

	const isDateSelected = (date: Date) => {
		if (!selectedDate) return false;
		return (
			date.getDate() === selectedDate.getDate() &&
			date.getMonth() === selectedDate.getMonth() &&
			date.getFullYear() === selectedDate.getFullYear()
		);
	};

	const isToday = (date: Date) => {
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

	return (
		<div className={cn("p-4", className)} {...props}>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<Button
					variant="outline"
					size="sm"
					onClick={goToPreviousMonth}
					className="h-8 w-8 p-0"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<h2 className="text-sm font-medium">
					{monthNames[currentDate.getMonth()]}{" "}
					{currentDate.getFullYear()}
				</h2>

				<Button
					variant="outline"
					size="sm"
					onClick={goToNextMonth}
					className="h-8 w-8 p-0"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Calendar Grid */}
			<div className="grid grid-cols-7 gap-1">
				{/* Day Headers */}
				{dayNames.map((day) => (
					<div
						key={day}
						className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
					>
						{day}
					</div>
				))}

				{/* Calendar Days */}
				{calendarDays.map(({ date, day, isCurrentMonth }, index) => {
					const dateString = `${date.getFullYear()}-${String(
						date.getMonth() + 1
					).padStart(2, "0")}-${String(date.getDate()).padStart(
						2,
						"0"
					)}`;
					const hasAppointment =
						appointmentDates.includes(dateString);
					const isSelected = isDateSelected(date);
					const isTodayDate = isToday(date);
					const isDisabled = disabled && disabled(date);

					return (
						<button
							key={index}
							onClick={() =>
								handleDateClick(date, isCurrentMonth)
							}
							disabled={!isCurrentMonth || isDisabled}
							className={cn(
								"h-8 w-full flex items-center justify-center text-sm rounded-md transition-colors",
								"hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200",
								{
									"bg-black text-white hover:bg-black":
										isSelected,
									"bg-gray-100 font-medium":
										isTodayDate && !isSelected,
									"text-gray-900":
										isCurrentMonth &&
										!isSelected &&
										!isTodayDate,
									"text-gray-400": !isCurrentMonth,
									"opacity-50 cursor-not-allowed hover:bg-transparent":
										isDisabled,
								}
							)}
						>
							<div className="flex flex-col items-center">
								<span>{day}</span>
								{hasAppointment && isCurrentMonth && (
									<div className="w-1 h-1 rounded-full bg-teal-500 mt-1"></div>
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
