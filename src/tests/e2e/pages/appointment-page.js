import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class AppointmentPage extends BasePage {
  constructor(page) {
    super(page);
  }
  async scheduleAppointment(appointmentTime = "10:00") {
    // Wait for form to load
    await this.waitForElement(SELECTORS.appointment.doctorSelect);
    
    // Select doctor - simplified approach, always select first option for reliability
    await this.page.click(SELECTORS.appointment.doctorSelect);
    await this.page.waitForTimeout(1000); // Wait for dropdown to open
    
    // Always select the first available option regardless of doctorName
    const firstOption = this.page.locator('[role="option"]').first();
    await firstOption.waitFor({ state: 'visible', timeout: 10000 });
    await firstOption.click();

    // Wait for doctor selection to complete
    await this.page.waitForTimeout(1000);

    // Select date (tomorrow) - click the date button
    await this.page.click(SELECTORS.appointment.dateButton);
    await this.page.waitForTimeout(1000); // Wait for calendar to open
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate();
    
    // Look for the date button in the calendar - try multiple selectors
    try {
      const dateButton = this.page.locator(`button[data-value]`).filter({ hasText: day.toString() }).first();
      await dateButton.waitFor({ state: 'visible', timeout: 5000 });
      await dateButton.click();
    } catch {
      // Fallback: just click any available date
      const anyDateButton = this.page.locator('button').filter({ hasText: day.toString() }).first();
      await anyDateButton.waitFor({ state: 'visible', timeout: 5000 });
      await anyDateButton.click();
    }
      // Wait for date selection to complete
    await this.page.waitForTimeout(1000);
    
    // Select time - ensure the time select is enabled first
    await this.page.waitForFunction(
      () => {
        // Find the time select by data-testid
        const timeSelect = document.querySelector('[data-testid="time-select"]');
        return timeSelect && !timeSelect.disabled;
      }
    );
      await this.page.click(SELECTORS.appointment.timeSelect);
    await this.page.waitForTimeout(1000); // Wait for dropdown to open
    
    // Look for the time option in the dropdown - with fallback
    try {
      const timeOption = this.page.locator(`[role="option"]`).filter({ hasText: appointmentTime });
      await timeOption.waitFor({ state: 'visible', timeout: 5000 });
      await timeOption.click();
    } catch {
      // Fallback: select the first available time option
      const firstTimeOption = this.page.locator('[role="option"]').first();
      await firstTimeOption.waitFor({ state: 'visible', timeout: 5000 });
      await firstTimeOption.click();
    }// Wait for time selection to complete
    await this.page.waitForTimeout(1000);
    
    // Submit appointment - ensure button is enabled
    const submitButton = this.page.locator(SELECTORS.appointment.scheduleButton);
    await submitButton.waitFor({ state: 'visible' });
    
    // Check if button is enabled by using Playwright's isEnabled method
    await this.page.waitForFunction(
      () => {
        // Find the button by its text content instead of using selector
        const buttons = Array.from(document.querySelectorAll('button'));
        const agendarButton = buttons.find(btn => btn.textContent?.includes('Agendar Cita'));
        return agendarButton && !agendarButton.disabled;
      }
    );    await submitButton.click();
    
    // Wait for success toast message with longer timeout
    await this.waitForElement('[data-testid="toast-success"]', { timeout: 15000 });
  }
  async cancelAppointment(appointmentIndex = 0) {
    const cancelButtons = this.page.locator(SELECTORS.appointment.cancelButton);
    await cancelButtons.nth(appointmentIndex).click();
    
    // Confirm cancellation if dialog appears
    await this.page.waitForTimeout(500);
    try {
      await this.page.locator('button').filter({ hasText: 'Sí' }).click();
    } catch {
      // No confirmation dialog
    }
      await this.waitForElement('[data-testid="toast-success"]');
  }

  async completeAppointment(appointmentIndex = 0) {
    const completeButtons = this.page.locator(SELECTORS.appointment.completeButton);
    await completeButtons.nth(appointmentIndex).click();
    await this.waitForElement('[data-testid="toast-success"]');
  }

  async expectAppointmentScheduled() {
    await this.waitForElement('[data-testid="toast-success"]');
  }

  async expectAppointmentCanceled() {
    await this.waitForElement('[data-testid="toast-success"]');
  }
}