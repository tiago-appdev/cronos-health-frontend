import { HomePage } from '../pages/home-page.js';
import { RegisterPage } from '../pages/register-page.js';
import { LoginPage } from '../pages/login-page.js';
import { DashboardPage } from '../pages/dashboard-page.js';
import { generateUniqueUser } from '../fixtures/test-data.js';

export class AuthHelper {
  constructor(page) {
    this.page = page;
    this.homePage = new HomePage(page);
    this.registerPage = new RegisterPage(page);
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  async registerAndLogin(userType = 'patient') {
    const userData = generateUniqueUser(userType);
    
    await this.homePage.goto();
    await this.homePage.clickRegister();
    await this.registerPage.register(userData);
    
    // Should be automatically logged in after registration
    await this.dashboardPage.expectWelcome(userData.name);
    
    return userData;
  }

  async loginExistingUser(email, password) {
    await this.homePage.goto();
    await this.homePage.clickLogin();
    await this.loginPage.login(email, password);
    await this.dashboardPage.page.waitForURL(/\/dashboard/);
  }

  async logout() {
    await this.dashboardPage.logout();
    await this.homePage.page.waitForURL('/');
  }
}