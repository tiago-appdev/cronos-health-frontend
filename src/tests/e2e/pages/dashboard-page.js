import { BasePage } from "./base-page.js";
import { expect } from "@playwright/test";

export class DashboardPage extends BasePage {
	constructor(page) {
		super(page);

		// Locators
		this.welcomeMessage = page.locator('h2:has-text("Bienvenido")');
		this.userAvatar = page.locator('[data-testid="user-avatar"], .avatar');
		this.logoutButton = page.locator(
			'[data-testid="logout-button"], button:has-text("Cerrar Sesión")'
		);

		// Tabs
		this.appointmentsTab = page.locator(
			'[data-testid="appointments-tab"], button:has-text("Mis Turnos"), button:has-text("Mis Citas")'
		);
		this.scheduleTab = page.locator(
			'[data-testid="schedule-tab"], button:has-text("Agendar Turno"), button:has-text("Programar Cita")'
		).first();

		// Appointments
		this.appointmentsList = page.locator(
			'[data-testid="appointments-list"]'
		);
		this.appointmentCard = page.locator(
			'[data-testid="appointment-card"], .border.rounded-lg'
		);
		this.cancelButton = page.locator(
			'[data-testid="cancel-button"], button:has-text("Cancelar")'
		);
		this.rescheduleButton = page.locator(
			'[data-testid="reschedule-button"], button:has-text("Reprogramar")'
		);

		// Empty state
		this.emptyState = page.locator(
			'text="No tienes turnos programados", text="No tienes citas programadas"'
		);
		this.bookAppointmentButton = page.locator(
			'button:has-text("Agendar Turno"), button:has-text("Programar Cita")'
		);

		// Navigation
		this.sidebar = page.locator(
			'[data-testid="sidebar"], .fixed.inset-y-0'
		);
		this.profileLink = page.locator('a:has-text("Mi Perfil")');
		this.historyLink = page.locator('a:has-text("Historial")');
	}

	async goto() {
		await super.goto("/dashboard");
	}

	async expectWelcome(userName) {
		await expect(this.welcomeMessage).toContainText(
			`Bienvenido, ${userName}`
		);
	}

	async logout() {
		await this.logoutButton.click();
	}

	async switchToScheduleTab() {
		await this.scheduleTab.click();
	}

	async getAppointmentCount() {
		return await this.appointmentCard.count();
	}

	async cancelFirstAppointment() {
		await this.cancelButton.first().click();
	}

	async expectAppointment(doctorName) {
		await expect(
			this.appointmentCard.filter({ hasText: doctorName })
		).toBeVisible();
	}
}
