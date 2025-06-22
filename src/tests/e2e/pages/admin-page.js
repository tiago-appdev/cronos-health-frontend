import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class AdminPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoAdmin() {
    await this.goto('/admin');
    await this.waitForElement('text=Panel de Administración');
  }

  async goToUsersManagement() {
    await this.clickAndWait(SELECTORS.admin.usersTab);
  }

  async goToSurveys() {
    await this.clickAndWait(SELECTORS.admin.surveysTab);
  }

  async createNewUser(userData) {
    await this.clickAndWait(SELECTORS.admin.newUserButton);
    
    await this.fillForm({
      'input[id="name"]': userData.name,
      'input[id="email"]': userData.email,
      'input[id="password"]': userData.password
    });

    // Select user type
    await this.page.click(`input[value="${userData.userType}"]`);
    
    await this.clickAndWait('text=Crear Usuario');
    await this.waitForElement('text=Usuario creado');
  }

  async searchUser(searchTerm) {
    await this.page.fill('input[placeholder*="Buscar"]', searchTerm);
    await this.page.waitForTimeout(1000); // Wait for search
  }

  async deleteUser(userName) {
    // Find the user row and click delete
    const userRow = this.page.locator(`text=${userName}`).locator('..').locator('..');
    await userRow.locator('button:has([data-icon="trash"])').click();
    
    // Confirm deletion
    await this.page.click('text=Sí');
    await this.waitForElement('text=Usuario eliminado');
  }

  async expectUserCreated() {
    await this.waitForElement('text=Usuario creado');
  }

  async expectUserDeleted() {
    await this.waitForElement('text=Usuario eliminado');
  }

  async getUserCount() {
    const userCards = await this.page.locator('[data-testid="user-card"]').count();
    return userCards;
  }

  async getSurveyCount() {
    const surveyCards = await this.page.locator('[data-testid="survey-card"]').count();
    return surveyCards;
  }
}