import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoDashboard() {
    await this.goto('/dashboard');
    await this.waitForElement(SELECTORS.dashboard.welcomeMessage);
  }

  async expectWelcomeMessage(userName) {
    await this.expectToContainText(`Bienvenido, ${userName}`);
  }

  async goToAppointments() {
    await this.clickAndWait(SELECTORS.dashboard.appointmentsTab);
  }

  async goToScheduleAppointment() {
    await this.clickAndWait(SELECTORS.dashboard.scheduleTab);
  }

  async goToMedicalHistory() {
    await this.clickAndWait(SELECTORS.dashboard.medicalHistoryTab);
  }

  async hasAppointments() {
    try {
      await this.waitForElement('text=Próximos Turnos', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getAppointmentCount() {
    const appointments = await this.page.locator('[data-testid="appointment-card"]').count();
    return appointments;
  }
}