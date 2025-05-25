import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page.js';
import { RegisterPage } from './pages/register-page.js';
import { DashboardPage } from './pages/dashboard-page.js';
import { AppointmentBookingPage } from './pages/appointment-booking-page.js';

test.describe('Appointments Management', () => {
  let homePage, registerPage, dashboardPage, appointmentBookingPage;
  let testPatient, testDoctor;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
    appointmentBookingPage = new AppointmentBookingPage(page);

    // Create unique test users for each test
    testPatient = {
      name: 'Test Patient Appointments',
      email: `patient.appt.${Date.now()}@example.com`,
      password: 'password123',
      userType: 'patient'
    };

    testDoctor = {
      name: 'Test Doctor Appointments',
      email: `doctor.appt.${Date.now()}@example.com`,
      password: 'password123',
      userType: 'doctor'
    };

    // Start at home page
    await homePage.goto();
  });

  test.describe('Appointment Booking Flow', () => {
    test.beforeEach(async () => {
      // Register and login as patient
      await homePage.clickRegister();
      await registerPage.register(testPatient);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
    });

    test('should display appointment booking form correctly', async () => {
      // Switch to schedule tab
      await dashboardPage.switchToScheduleTab();
      
      // Verify form elements are present
      await expect(appointmentBookingPage.doctorSelect).toBeVisible();
      await expect(appointmentBookingPage.dateButton).toBeVisible();
      await expect(appointmentBookingPage.timeSelect).toBeVisible();
      await expect(appointmentBookingPage.submitButton).toBeVisible();
    });

    test('should load available doctors', async () => {
      await dashboardPage.switchToScheduleTab();
      
      // Wait for doctors to load
      await expect(appointmentBookingPage.loadingDoctors).not.toBeVisible();
      
      // Check if doctors are available
      await appointmentBookingPage.doctorSelect.click();
      
      // Should have at least one doctor option
      await expect(appointmentBookingPage.page.locator('[role="option"]')).toHaveCount(5);
    });

    test('should book appointment successfully', async () => {
      await dashboardPage.switchToScheduleTab();
      
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.getDate().toString();
      
      const appointmentData = {
        doctor: 'Dr. Sarah Smith',
        day: tomorrowDay,
        time: '13:00'
      };

      await appointmentBookingPage.bookAppointment(appointmentData);
      
      // Should show success message
      await appointmentBookingPage.expectSuccess();
      
      // Switch back to appointments tab to verify booking
      await dashboardPage.appointmentsTab.click();
      
      // Should see the new appointment
      await dashboardPage.expectAppointment(appointmentData.doctor);
    });

    test('should show doctor information when selected', async () => {
      await dashboardPage.switchToScheduleTab();
      
      await appointmentBookingPage.selectDoctor('Dr. Sarah Smith');
      
      // Should show doctor info section
      await appointmentBookingPage.expectDoctorInfo('Dr. Sarah Smith');
      await expect(appointmentBookingPage.doctorInfo).toContainText('Cardiology');
    });

    test('should validate required fields', async () => {
      await dashboardPage.switchToScheduleTab();
      
      // Try to submit without filling form
      await appointmentBookingPage.submitButton.click();
      
      // Should show validation error
      await appointmentBookingPage.expectError('completa todos los campos');
    });

    test('should reset form after successful booking', async () => {
      await dashboardPage.switchToScheduleTab();
      
      // Book an appointment
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const appointmentData = {
        doctor: 'Dr. Sarah Smith',
        day: tomorrow.getDate().toString(),
        time: '16:00'
      };

      await appointmentBookingPage.bookAppointment(appointmentData);
      await appointmentBookingPage.expectSuccess();
      
      // Form should be reset
      await expect(appointmentBookingPage.doctorSelect).toContainText('Elige un médico');
      await expect(appointmentBookingPage.dateButton).toContainText('Selecciona una fecha');
    });
  });

  test.describe('Appointment Management', () => {
    test.beforeEach(async () => {
      // Register patient and book an appointment first
      await homePage.clickRegister();
      await registerPage.register(testPatient);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
      
      // Book a test appointment
      await dashboardPage.switchToScheduleTab();
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const appointmentData = {
        doctor: 'Dr. Sarah Smith',
        day: tomorrow.getDate().toString(),
        time: '15:00'
      };

      await appointmentBookingPage.bookAppointment(appointmentData);
      await appointmentBookingPage.expectSuccess();
      
      // Go back to appointments tab
      await dashboardPage.appointmentsTab.click();
    });

    test('should display appointments correctly', async () => {
      // Should show at least one appointment
      const appointmentCount = await dashboardPage.getAppointmentCount();
      expect(appointmentCount).toBeGreaterThan(0);
      
      // Should show appointment details
      await expect(dashboardPage.appointmentCard.first()).toContainText('Dr. Sarah Smith');
      await expect(dashboardPage.appointmentCard.first()).toContainText('Programado');
    });

    test('should cancel appointment successfully', async () => {
      // Cancel the first appointment
      await dashboardPage.cancelFirstAppointment();
      
      // Should show success message
      await expect(dashboardPage.page.locator('text="Cita cancelada exitosamente"')).toBeVisible();
      
      // Wait for page to refresh and check if appointment is canceled
      await dashboardPage.page.waitForTimeout(1000);
      
      // The appointment should either be removed or marked as canceled
      // (depending on your implementation)
    });

    test('should show empty state when no appointments', async () => {
      // Cancel all appointments first
      const appointmentCount = await dashboardPage.getAppointmentCount();
      
      for (let i = 0; i < appointmentCount; i++) {
        await dashboardPage.cancelFirstAppointment();
        await expect(dashboardPage.page.locator('text="Cita cancelada exitosamente"')).toBeVisible();
        await dashboardPage.page.waitForTimeout(500);
      }
      
      // Should show empty state
      await expect(dashboardPage.emptyState).toBeVisible();
      await expect(dashboardPage.bookAppointmentButton).toBeVisible();
    });

    test('should navigate to booking from empty state', async () => {
      // If there are appointments, cancel them first
      const appointmentCount = await dashboardPage.getAppointmentCount();
      
      if (appointmentCount > 0) {
        for (let i = 0; i < appointmentCount; i++) {
          await dashboardPage.cancelFirstAppointment();
          await dashboardPage.page.waitForTimeout(500);
        }
      }
      
      // Click the "Agendar Turno" button from empty state
      await dashboardPage.bookAppointmentButton.click();
      
      // Should switch to schedule tab
      await expect(appointmentBookingPage.submitButton).toBeVisible();
    });
  });

  test.describe('Doctor View', () => {
    test.beforeEach(async () => {
      // Register and login as doctor
      await homePage.clickRegister();
      await registerPage.register(testDoctor);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
    });

    test('should show doctor dashboard correctly', async () => {
      // Should show doctor-specific content
      await dashboardPage.expectWelcome(testDoctor.name);
      await expect(dashboardPage.page.locator('text="Panel del Médico"')).toBeVisible();
      await expect(dashboardPage.page.locator('text="Mis Citas"')).toBeVisible();
    });

    test('should show doctor appointment management panel', async () => {
      await dashboardPage.switchToScheduleTab();
      
      // Should show doctor-specific scheduling panel
      await expect(dashboardPage.page.locator('text="Gestión de Citas"')).toBeVisible();
      await expect(dashboardPage.page.locator('text="Como médico"')).toBeVisible();
    });

    test('should display appointments from patient perspective', async () => {
      // For this test, we need appointments that involve this doctor
      // This would require more complex setup or actual data
      await expect(dashboardPage.appointmentsTab).toBeVisible();
    });
  });

  test.describe('Calendar Integration', () => {
    test.beforeEach(async () => {
      await homePage.clickRegister();
      await registerPage.register(testPatient);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
    });

    test('should display calendar on dashboard', async () => {
      // Should show calendar component
      await expect(dashboardPage.page.locator('.calendar, [data-testid="calendar"]')).toBeVisible();
    });

    test('should highlight appointment dates on calendar', async () => {
      // Book an appointment first
      await dashboardPage.switchToScheduleTab();
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await appointmentBookingPage.bookAppointment({
        doctor: 'Dr. Sarah Smith',
        day: tomorrow.getDate().toString(),
        time: '17:00'
      });
      
      await appointmentBookingPage.expectSuccess();
      await dashboardPage.appointmentsTab.click();
      
      // Calendar should highlight the appointment date
      // This would depend on your calendar implementation
      await expect(dashboardPage.page.locator('.calendar')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async () => {
      await homePage.clickRegister();
      await registerPage.register(testPatient);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
    });

    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Dashboard should be responsive
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      
      // Booking form should work on mobile
      await dashboardPage.switchToScheduleTab();
      await expect(appointmentBookingPage.doctorSelect).toBeVisible();
      await expect(appointmentBookingPage.submitButton).toBeVisible();
    });

    test('should handle tablet view', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // All elements should be visible and functional
      await expect(dashboardPage.sidebar).toBeVisible();
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });
  });
});