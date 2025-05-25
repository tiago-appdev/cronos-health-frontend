import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page.js';
import { LoginPage } from './pages/login-page.js';
import { RegisterPage } from './pages/register-page.js';
import { DashboardPage } from './pages/dashboard-page.js';

test.describe('Authentication Flow', () => {
  let homePage, loginPage, registerPage, dashboardPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
    
    await homePage.goto();
  });

  test.describe('User Registration', () => {
    test('should register a new patient successfully', async () => {
      // Navigate to registration
      await homePage.clickRegister();
      await expect(registerPage.page).toHaveURL(/\/register/);

      // Fill registration form
      const userData = {
        name: 'Test Patient E2E',
        email: `patient.e2e.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'patient'
      };

      await registerPage.register(userData);

      // Should redirect to dashboard
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
      await dashboardPage.expectWelcome(userData.name);
    });

    test('should register a new doctor successfully', async () => {
      await homePage.clickRegister();

      const userData = {
        name: 'Test Doctor E2E',
        email: `doctor.e2e.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'doctor'
      };

      await registerPage.register(userData);

      // Should redirect to dashboard
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
      await dashboardPage.expectWelcome(userData.name);
    });

    test('should show error for password mismatch', async () => {
      await homePage.clickRegister();

      const userData = {
        name: 'Test User',
        email: `test.${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'differentpassword',
        userType: 'patient'
      };

      await registerPage.register(userData);

      // Should show error and stay on registration page
      await registerPage.expectErrorMessage('Las contraseñas no coinciden');
      await expect(registerPage.page).toHaveURL(/\/register/);
    });

    test('should show error for duplicate email', async () => {
      // First registration
      await homePage.clickRegister();
      
      const userData = {
        name: 'First User',
        email: `duplicate.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'patient'
      };

      await registerPage.register(userData);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);

      // Logout and try to register with same email
      await dashboardPage.logout();
      await expect(homePage.page).toHaveURL('/');

      await homePage.clickRegister();
      
      const duplicateUserData = {
        name: 'Second User',
        email: userData.email, // Same email
        password: 'password123',
        userType: 'patient'
      };

      await registerPage.register(duplicateUserData);
      await registerPage.expectErrorMessage('usuario ya existe');
    });

    test('should validate required fields', async () => {
      await homePage.clickRegister();

      // Try to submit empty form
      await registerPage.registerButton.click();

      // HTML5 validation should prevent submission
      await expect(registerPage.page).toHaveURL(/\/register/);
    });
  });

  test.describe('User Login', () => {
    let testUser;

    test.beforeEach(async () => {
      // Create a test user for login tests
      testUser = {
        name: 'Login Test User',
        email: `login.test.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'patient'
      };

      // Register the user first
      await homePage.clickRegister();
      await registerPage.register(testUser);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
      
      // Logout to test login
      await dashboardPage.logout();
      await expect(homePage.page).toHaveURL('/');
    });

    test('should login with valid credentials', async () => {
      await homePage.clickLogin();
      await expect(loginPage.page).toHaveURL(/\/login/);

      await loginPage.login(testUser.email, testUser.password);

      // Should redirect to dashboard
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
      await dashboardPage.expectWelcome(testUser.name);
    });

    test('should show error for invalid email', async () => {
      await homePage.clickLogin();

      await loginPage.login('nonexistent@example.com', 'password123');

      await loginPage.expectErrorMessage('Credenciales inválidas');
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should show error for invalid password', async () => {
      await homePage.clickLogin();

      await loginPage.login(testUser.email, 'wrongpassword');

      await loginPage.expectErrorMessage('Credenciales inválidas');
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should validate required fields', async () => {
      await homePage.clickLogin();

      // Try to submit empty form
      await loginPage.loginButton.click();

      // HTML5 validation should prevent submission
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should show loading state during login', async () => {
      await homePage.clickLogin();

      await loginPage.emailInput.fill(testUser.email);
      await loginPage.passwordInput.fill(testUser.password);
      await loginPage.loginButton.click();

      // Should briefly show loading state
      await loginPage.expectLoadingState();
    });
  });

  test.describe('Authentication State', () => {
    test('should redirect logged-in users away from auth pages', async () => {
      // Register and login a user
      const userData = {
        name: 'Redirect Test User',
        email: `redirect.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'patient'
      };

      await homePage.clickRegister();
      await registerPage.register(userData);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);

      // Try to go to login page - should redirect to dashboard
      await loginPage.goto();
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);

      // Try to go to register page - should redirect to dashboard
      await registerPage.goto();
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
    });

    test('should redirect unauthenticated users from protected pages', async () => {
      // Try to access dashboard without authentication
      await dashboardPage.goto();
      
      // Should redirect to login
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should update header based on auth state', async () => {
      // Initially logged out
      await homePage.expectLoggedOut();

      // Register a user
      const userData = {
        name: 'Header Test User',
        email: `header.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'patient'
      };

      await homePage.clickRegister();
      await registerPage.register(userData);
      
      // Go back to home page
      await homePage.goto();
      
      // Should show logged-in state
      await homePage.expectLoggedIn(userData.name);

      // Logout
      await homePage.logout();
      
      // Should show logged-out state
      await homePage.expectLoggedOut();
    });
  });

  test.describe('Navigation Flow', () => {
    test('should navigate between auth pages correctly', async () => {
      // Start at home, go to login
      await homePage.clickLogin();
      await expect(loginPage.page).toHaveURL(/\/login/);

      // Navigate to register from login
      await loginPage.clickRegisterLink();
      await expect(registerPage.page).toHaveURL(/\/register/);

      // Navigate back to login from register
      await registerPage.loginLink.click();
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('should complete full auth flow', async () => {
      // Register → Dashboard → Logout → Login → Dashboard
      const userData = {
        name: 'Full Flow User',
        email: `fullflow.${Date.now()}@example.com`,
        password: 'password123',
        userType: 'patient'
      };

      // Register
      await homePage.clickRegister();
      await registerPage.register(userData);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);

      // Logout
      await dashboardPage.logout();
      await expect(homePage.page).toHaveURL('/');

      // Login
      await homePage.clickLogin();
      await loginPage.login(userData.email, userData.password);
      await expect(dashboardPage.page).toHaveURL(/\/dashboard/);

      // Verify user data persisted
      await dashboardPage.expectWelcome(userData.name);
    });
  });
});