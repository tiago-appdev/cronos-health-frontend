import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class AppointmentPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async scheduleAppointment(doctorName = null, appointmentTime = "10:00") {
    // Wait for form to load
    await this.waitForElement(SELECTORS.appointment.doctorSelect);
    
    // Select doctor (first available if none specified)
    await this.page.click(SELECTORS.appointment.doctorSelect);
    if (doctorName) {
      await this.page.click(`text=${doctorName}`);
    } else {
      // Select first doctor option
      await this.page.click('[role="option"]:first-child');
    }

    // Select date (tomorrow)
    await this.page.click(SELECTORS.appointment.dateButton);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate();
    await this.page.click(`button:has-text("${day}")`);

    // Select time
    await this.page.click(SELECTORS.appointment.timeSelect);
    await this.page.click(`text=${appointmentTime}`);

    // Submit appointment
    await this.clickAndWait(SELECTORS.appointment.scheduleButton);
    
    // Wait for success message
    await this.waitForElement('text=Cita agendada exitosamente');
  }

  async cancelAppointment(appointmentIndex = 0) {
    const cancelButtons = this.page.locator(SELECTORS.appointment.cancelButton);
    await cancelButtons.nth(appointmentIndex).click();
    
    // Confirm cancellation if dialog appears
    await this.page.waitForTimeout(500);
    try {
      await this.page.click('text=Sí');
    } catch {
      // No confirmation dialog
    }
    
    await this.waitForElement('text=Cita cancelada exitosamente');
  }

  async completeAppointment(appointmentIndex = 0) {
    const completeButtons = this.page.locator(SELECTORS.appointment.completeButton);
    await completeButtons.nth(appointmentIndex).click();
    await this.waitForElement('text=Cita marcada como completada');
  }

  async expectAppointmentScheduled() {
    await this.waitForElement('text=Cita agendada exitosamente');
  }

  async expectAppointmentCanceled() {
    await this.waitForElement('text=Cita cancelada exitosamente');
  }
}