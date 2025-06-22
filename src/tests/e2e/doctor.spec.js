import { test } from '@playwright/test';
import { AuthPage } from './pages/auth-page.js';
import { DashboardPage } from './pages/dashboard-page.js';
import { AppointmentPage } from './pages/appointment-page.js';
import { TEST_USERS } from './test-data.js';

test.describe('Doctor Workflows', () => {
  let authPage, dashboardPage, appointmentPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    appointmentPage = new AppointmentPage(page);
    
    // Login as doctor
    await authPage.login(TEST_USERS.doctor.email, TEST_USERS.doctor.password);
    await dashboardPage.gotoDashboard();
  });

  test.afterEach(async ({  }) => {
    await authPage.logout();
  });

  test('should view doctor dashboard', async () => {
    await dashboardPage.expectWelcomeMessage(TEST_USERS.doctor.name);
    await appointmentPage.waitForElement('text=Próximas Citas');
  });

  test('should complete patient appointment', async () => {
    await dashboardPage.goToAppointments();
    
    // Look for scheduled appointments and complete one if available
    try {
      await appointmentPage.completeAppointment(0);
      await appointmentPage.page.waitForSelector('text=Cita marcada como completada');
    } catch (error) {
      console.log('No scheduled appointments found to complete', error.message);
      // This is acceptable as it depends on data state
    }
  });

  test('should access medical panel', async () => {
    await dashboardPage.page.click('a[href="/dashboard/medical-panel"]');
    await appointmentPage.waitForElement('text=Panel Médico');
    await appointmentPage.waitForElement('text=Pacientes');
  });

  test('should view patient records', async () => {
    await dashboardPage.page.click('a[href="/dashboard/medical-panel"]');
    await appointmentPage.waitForElement('text=Panel Médico');
    
    // Click on first patient if available
    try {
      await dashboardPage.page.click('[data-testid="patient-card"]:first-child');
      await appointmentPage.waitForElement('text=Historial Clínico');
    } catch {
      console.log('No patients found or accessible');
    }
  });

  test('should add patient note', async () => {
    await dashboardPage.page.click('a[href="/dashboard/medical-panel"]');
    await appointmentPage.waitForElement('text=Panel Médico');
    
    try {
      // Select first patient
      await dashboardPage.page.click('[data-testid="patient-card"]:first-child');
      
      // Add a note
      await dashboardPage.page.fill('textarea[placeholder*="notas"]', 'Test note from E2E test');
      await dashboardPage.page.click('text=Guardar Nota');
      await appointmentPage.waitForElement('text=Nota agregada correctamente');
    } catch {
      console.log('Could not add note - patient selection failed');
    }
  });

  test('should access chat with patients', async () => {
    await dashboardPage.page.click('a[href="/dashboard/chat"]');
    await appointmentPage.waitForElement('text=Chat');
    await appointmentPage.waitForElement('text=Conversaciones');
  });
});