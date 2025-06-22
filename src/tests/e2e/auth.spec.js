import { test } from '@playwright/test';
import { AuthPage } from './pages/auth-page.js';
import { DashboardPage } from './pages/dashboard-page.js';
import { TEST_USERS, TEST_DATA } from './test-data.js';

test.describe('Authentication', () => {
  let authPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });  test.afterEach(async ({ page }) => {
    // Simple cleanup - just navigate to home page to ensure clean state
    await page.goto('/');
  });

  test('should login as patient successfully', async () => {
    await authPage.login(TEST_USERS.patient.email, TEST_USERS.patient.password);
    await authPage.expectLoginSuccess('patient');
    await dashboardPage.expectWelcomeMessage(TEST_USERS.patient.name);
  });

  test('should login as doctor successfully', async () => {
    await authPage.login(TEST_USERS.doctor.email, TEST_USERS.doctor.password);
    await authPage.expectLoginSuccess('doctor');
    await dashboardPage.expectWelcomeMessage(TEST_USERS.doctor.name);
  });

  test('should login as admin successfully', async () => {
    await authPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await authPage.expectLoginSuccess('admin');
  });

  test('should reject invalid credentials', async () => {
    await authPage.login('invalid@email.com', 'wrongpassword');
    await authPage.expectLoginError();
  });

  test('should register new patient successfully', async () => {
    await authPage.register(TEST_DATA.newUser.patient);
    await authPage.expectRegistrationSuccess();
    await dashboardPage.expectWelcomeMessage(TEST_DATA.newUser.patient.name);
  });

  test('should register new doctor successfully', async () => {
    await authPage.register(TEST_DATA.newUser.doctor);
    await authPage.expectRegistrationSuccess();
    await dashboardPage.expectWelcomeMessage(TEST_DATA.newUser.doctor.name);
  });

  test('should prevent registration with existing email', async () => {
    const existingUserData = {
      ...TEST_DATA.newUser.patient,
      email: TEST_USERS.patient.email
    };
    
    await authPage.register(existingUserData);
    await authPage.page.waitForSelector('text=Error de registro');
  });

  test('should logout successfully', async () => {
    await authPage.login(TEST_USERS.patient.email, TEST_USERS.patient.password);
    await authPage.expectLoginSuccess('patient');
    await authPage.logout();
    await authPage.page.waitForURL('/');
  });
});