import { BasePage } from "./base-page.js";

export class RegisterPage extends BasePage {
	constructor(page) {
		super(page);

		// Locators
		this.nameInput = page.locator(
			'[data-testid="name-input"], input[placeholder*="Juan Pérez"]'
		);
		this.emailInput = page.locator(
			'[data-testid="email-input"], input[type="email"]'
		);
		this.passwordInput = page.locator(
			'[data-testid="password-input"]:first-of-type, input[type="password"]:first-of-type'
		).first();
		this.confirmPasswordInput = page.locator(
			'[data-testid="confirm-password-input"], input[type="password"]:last-of-type'
		).last();
		this.patientRadio = page.locator(
			'[data-testid="patient-radio"], input[value="patient"]'
		);
		this.doctorRadio = page.locator(
			'[data-testid="doctor-radio"], input[value="doctor"]'
		);
		this.registerButton = page.locator(
			'[data-testid="register-button"], button:has-text("Registrarse")'
		);
		this.errorMessage = page.locator(
			'[data-testid="error-message"], .error, [role="alert"]'
		);
		this.loginLink = page.locator('a:has-text("Iniciar Sesión")');
	}

	async goto() {
		await super.goto("/register");
	}

	async register(userData) {
		await this.nameInput.fill(userData.name);
		await this.emailInput.fill(userData.email);
		await this.passwordInput.fill(userData.password);
		await this.confirmPasswordInput.fill(
			userData.confirmPassword || userData.password
		);

		if (userData.userType === "doctor") {
			await this.doctorRadio.check();
		} else {
			await this.patientRadio.check();
		}

		await this.registerButton.click();
	}

	async expectErrorMessage(message) {
		await expect(this.errorMessage).toContainText(message);
	}
}
