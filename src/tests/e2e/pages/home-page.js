import { BasePage } from "./base-page.js";
import { expect } from "@playwright/test";

export class HomePage extends BasePage {
	constructor(page) {
		super(page);

		// Header elements
		this.logo = page.locator('text="Cronos Health"');
		this.loginButton = page.locator('button:has-text("Iniciar Sesión")');
		this.registerButton = page.locator('button:has-text("Registrarse")');
		this.dashboardButton = page.locator('button:has-text("Dashboard")');
		this.logoutButton = page.locator('button:has-text("Cerrar Sesión")');
		this.userGreeting = page.locator('text="Hola,"');

		// Main content
		this.heroTitle = page.locator(
			'h1:has-text("Gestión de Turnos Médicos")'
		);
		this.getStartedButton = page.locator(
			'button:has-text("Comenzar Ahora")'
		);
		this.learnMoreButton = page.locator('button:has-text("Conocer Más")');
		this.featuresSection = page.locator("#features");
	}

	async goto() {
		await super.goto("/");
	}

	async clickLogin() {
		await this.loginButton.click();
	}

	async clickRegister() {
		await this.registerButton.click();
	}

	async clickDashboard() {
		await this.dashboardButton.click();
	}

	async logout() {
		await this.logoutButton.click();
	}

	async expectLoggedOut() {
		await expect(this.loginButton).toBeVisible();
		await expect(this.registerButton).toBeVisible();
	}

	async expectLoggedIn(userName) {
		await expect(this.userGreeting).toContainText(`Hola, ${userName}`);
		await expect(this.dashboardButton).toBeVisible();
		await expect(this.logoutButton).toBeVisible();
	}
}
