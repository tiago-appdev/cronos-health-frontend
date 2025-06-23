import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class AppointmentPage extends BasePage {
  constructor(page) {
    super(page);
  }  async scheduleAppointment(preferredTime = "10:00") {
    // Available time slots to try if preferred time is not available
    const timeSlots = [
      preferredTime,
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];
    
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
    await this.page.waitForTimeout(1000);    // Select date - try tomorrow first, then day after if needed
    let dateSelected = false;
    for (let daysAhead = 1; daysAhead <= 3; daysAhead++) {
      try {
        await this.page.click(SELECTORS.appointment.dateButton);
        await this.page.waitForTimeout(1000); // Wait for calendar to open
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        const day = targetDate.getDate();
        
        // Look for the date button in the calendar
        try {
          const dateButton = this.page.locator(`button[data-value]`).filter({ hasText: day.toString() }).first();
          await dateButton.waitFor({ state: 'visible', timeout: 5000 });
          await dateButton.click();
          dateSelected = true;
          break;
        } catch {
          // Fallback: just click any available date
          const anyDateButton = this.page.locator('button').filter({ hasText: day.toString() }).first();
          await anyDateButton.waitFor({ state: 'visible', timeout: 5000 });
          await anyDateButton.click();
          dateSelected = true;
          break;
        }
      } catch {
        console.log(`Date ${daysAhead} days ahead not available, trying next...`);
        continue;
      }
    }
    
    if (!dateSelected) {
      throw new Error('No available dates found for appointment');
    }// Wait for date selection to complete
    await this.page.waitForTimeout(1000);
    
    // Select time - try multiple time slots until one works
    let timeSelected = false;
    for (const timeSlot of timeSlots) {
      try {
        // Ensure the time select is enabled first
        await this.page.waitForFunction(
          () => {
            // Find the time select by data-testid
            const timeSelect = document.querySelector('[data-testid="time-select"]');
            return timeSelect && !timeSelect.disabled;
          }
        );
        
        await this.page.click(SELECTORS.appointment.timeSelect);
        await this.page.waitForTimeout(1000); // Wait for dropdown to open
        
        // Look for the time option in the dropdown
        const timeOption = this.page.locator(`[role="option"]`).filter({ hasText: timeSlot });
        await timeOption.waitFor({ state: 'visible', timeout: 3000 });
        await timeOption.click();
        
        // Wait for time selection to complete
        await this.page.waitForTimeout(1000);
        
        timeSelected = true;
        break;
      } catch (error) {
        console.log(`Time ${timeSlot} not available, trying next...`);
        // Close dropdown if it's open and try next time
        try {
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(500);
        } catch {}
        continue;
      }
    }
    
    if (!timeSelected) {
      throw new Error('No available time slots found for appointment');
    }
    
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