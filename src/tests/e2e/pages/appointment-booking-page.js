import { BasePage } from './base-page.js';
import { expect } from '@playwright/test';

export class AppointmentBookingPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Form elements
    this.doctorSelect = page.locator('[data-testid="doctor-select"], [role="combobox"]:has-text("Elige un médico")');
    this.doctorOption = (doctorName) => page.locator(`[role="option"]:has-text("${doctorName}")`);
    this.dateButton = page.locator('[data-testid="date-button"], button:has-text("Selecciona una fecha")');
    this.dateOption = (day) => page.locator(`button:has-text("${day}"):not([disabled])`);
    this.timeSelect = page.locator('[data-testid="time-select"], [role="combobox"]:has-text("Elige una hora")');
    this.timeOption = (time) => page.locator(`[role="option"]:has-text("${time}")`);
    this.submitButton = page.locator('[data-testid="submit-button"], button:has-text("Agendar Cita")');
    
    // Doctor info section
    this.doctorInfo = page.getByText('Información del MédicoNombre');
    
    // Loading states
    this.loadingDoctors = page.locator('text="Cargando médicos..."');
    this.submittingForm = page.locator('text="Agendando..."');
    
    // Success/Error messages
    this.successMessage = page.locator('text="Cita agendada exitosamente"');
    this.errorMessage = page.locator('[role="alert"], .error');
  }

  async selectDoctor(doctorName) {
    await this.doctorSelect.click();
    await this.doctorOption(doctorName).click();
  }

  async selectDate(day) {
    await this.dateButton.click();
    await this.dateOption(day).click();
  }

  async selectTime(time) {
    await this.timeSelect.click();
    await this.timeOption(time).click();
  }

  async bookAppointment(appointmentData) {
    // Wait for doctors to load
    await this.page.waitForTimeout(1000);
    
    await this.selectDoctor(appointmentData.doctor);
    await this.selectDate(appointmentData.day);
    await this.selectTime(appointmentData.time);
    await this.submitButton.click();
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectError(message) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectDoctorInfo(doctorName) {
    await expect(this.doctorInfo).toContainText(doctorName);
  }
}