import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
  }
  async gotoDashboard() {
    await this.goto('/dashboard');
    await this.waitForElement(SELECTORS.dashboard.welcomeMessage);
    // Wait for the dashboard content to load completely
    await this.waitForLoad();
  }

  async expectWelcomeMessage(userName) {
    await this.expectToContainText(`Bienvenido, ${userName}`);
  }  async goToAppointments() {
    // Click on appointments tab directly using the text
    await this.page.click('text=Mis Turnos');
    await this.page.waitForTimeout(1000);
  }

  async goToScheduleAppointment() {
    await this.clickAndWait(SELECTORS.dashboard.scheduleTab);
  }

  async goToMedicalHistory() {
    await this.clickAndWait(SELECTORS.dashboard.medicalHistoryTab);
  }
  async hasAppointments() {
    try {
      // Check if there are appointment cards or if we can see the "Próximos Turnos" title
      const hasTitle = await this.page.locator('text=Próximos Turnos').isVisible({ timeout: 2000 });
      if (hasTitle) {
        // Check if there are actual appointment cards
        const appointmentCards = await this.page.locator('[data-testid="appointment-card"]').count();
        return appointmentCards > 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getAppointmentCount() {
    const appointments = await this.page.locator('[data-testid="appointment-card"]').count();
    return appointments;
  }
}