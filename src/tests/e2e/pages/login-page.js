import { BasePage } from "./base-page.js";
import { expect } from "@playwright/test";

export class LoginPage extends BasePage {
	constructor(page) {
		super(page);

		// Locators
		this.emailInput = page.locator(
			'[data-testid="email-input"], input[type="email"]'
		);
		this.passwordInput = page.locator(
			'[data-testid="password-input"], input[type="password"]'
		);
		this.loginButton = page.locator(
			'[data-testid="login-button"], button:has-text("Iniciar Sesión")'
		);
		this.errorMessage = page.locator(
			'[data-testid="error-message"], .error, [role="alert"]'
		);
		this.loadingState = page.locator('text="Iniciando sesión..."');
		this.registerLink = page.locator('a:has-text("Regístrate")');
		this.forgotPasswordLink = page.locator(
			'a:has-text("¿Olvidaste tu contraseña?")'
		);
	}

	async goto() {
		await super.goto("/login");
	}

	async login(email, password) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.loginButton.click();
	}

	async expectErrorMessage(message) {
		await expect(this.errorMessage).toContainText(message);
	}

	async expectLoadingState() {
		await expect(this.loadingState).toBeVisible();
	}

	async clickRegisterLink() {
		await this.registerLink.click();
	}
}
