import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth-page.js';
import { DashboardPage } from './pages/dashboard-page.js';
import { AppointmentPage } from './pages/appointment-page.js';
import { SurveyPage } from './pages/survey-page.js';
import { TEST_USERS, TEST_DATA } from './test-data.js';

test.describe('Patient Workflows', () => {
  let authPage, dashboardPage, appointmentPage, surveyPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    appointmentPage = new AppointmentPage(page);
    surveyPage = new SurveyPage(page);
    
    // Login as patient
    await authPage.login(TEST_USERS.patient.email, TEST_USERS.patient.password);
    await dashboardPage.gotoDashboard();
  });

  test.afterEach(async ({  }) => {
    await authPage.logout();
  });

  test('should view dashboard and navigate sections', async () => {
    await dashboardPage.expectWelcomeMessage(TEST_USERS.patient.name);
    
    // Test navigation between tabs
    await dashboardPage.goToScheduleAppointment();
    await appointmentPage.waitForElement('text=Agendar Nueva Cita');
    
    await dashboardPage.goToAppointments();
    await appointmentPage.waitForElement('text=Próximos Turnos');
  });

  test('should schedule an appointment successfully', async () => {
    await dashboardPage.goToScheduleAppointment();
    await appointmentPage.scheduleAppointment();
    await appointmentPage.expectAppointmentScheduled();
    
    // Verify appointment appears in list
    await dashboardPage.goToAppointments();
    expect(await dashboardPage.hasAppointments()).toBe(true);
  });

  test('should cancel an appointment', async () => {
    // First schedule an appointment
    await dashboardPage.goToScheduleAppointment();
    await appointmentPage.scheduleAppointment();
    
    // Then cancel it
    await dashboardPage.goToAppointments();
    await appointmentPage.cancelAppointment(0);
    await appointmentPage.expectAppointmentCanceled();
  });

  test('should access medical history', async () => {
    await dashboardPage.page.click('a[href="/dashboard/history"]');
    await appointmentPage.waitForElement('text=Mi Historial Médico');
    
    // Should see history sections
    await appointmentPage.waitForElement('text=Consultas');
    await appointmentPage.waitForElement('text=Recetas');
    await appointmentPage.waitForElement('text=Exámenes');
  });

  test('should submit survey for completed appointment', async () => {
    // Navigate to survey page with mock data
    const surveyParams = new URLSearchParams({
      appointmentId: '1',
      doctorName: 'Dr. Gabriel Méndez',
      specialty: 'Cardiología',
      date: '2024-01-15'
    });
    
    await surveyPage.page.goto(`/survey?${surveyParams}`);
    await surveyPage.fillSurvey(TEST_DATA.survey);
    await surveyPage.expectSurveySubmitted();
  });

  test('should view submitted surveys', async () => {
    await surveyPage.gotoSurvey();
    await surveyPage.goToMySurveys();
    // Should show surveys tab content
    await surveyPage.waitForElement('text=Historial de encuestas');
  });

  test('should access chat functionality', async () => {
    await dashboardPage.page.click('a[href="/dashboard/chat"]');
    await appointmentPage.waitForElement('text=Chat');
    await appointmentPage.waitForElement('text=Conversaciones');
  });

  test('should update profile information', async () => {
    await dashboardPage.page.click('a[href="/dashboard/profile"]');
    await appointmentPage.waitForElement('text=Mi Perfil');
    
    // Click edit button
    await dashboardPage.page.click('text=Editar Perfil');
    
    // Update phone number
    await dashboardPage.page.fill('input[id="phone"]', '600123456');
    
    // Save changes
    await dashboardPage.page.click('text=Guardar');
    await appointmentPage.waitForElement('text=Perfil actualizado');
  });
});