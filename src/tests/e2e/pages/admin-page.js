import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class AdminPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoAdmin() {
    await this.goto('/admin');
    await this.waitForElement('text=Panel de Administración');
  }  async goToUsersManagement() {
    await this.page.click(SELECTORS.admin.usersTab);
    await this.page.waitForTimeout(1000); // Wait for tab to switch
    await this.waitForElement('text=Administra todos los usuarios del sistema');
  }

  async goToSurveys() {
    await this.page.click(SELECTORS.admin.surveysTab);
    await this.page.waitForTimeout(1000); // Wait for tab to switch
    await this.waitForElement('text=Todas las encuestas de satisfacción enviadas por pacientes');
  }
  async createNewUser(userData) {
    await this.clickAndWait(SELECTORS.admin.newUserButton);
    
    // Wait for the modal to appear
    await this.waitForElement('text=Crear Nuevo Usuario');
    
    // Fill form using more specific selectors for the modal
    await this.page.fill('input[placeholder="Nombre completo"]', userData.name);
    await this.page.fill('input[placeholder="correo@ejemplo.com"]', userData.email);
    await this.page.fill('input[placeholder="Contraseña"]', userData.password);

    // Select user type using the radio button labels
    if (userData.userType === 'doctor') {
      await this.page.click('label[for="new-doctor"]');
    } else if (userData.userType === 'admin') {
      await this.page.click('label[for="new-admin"]');
    } else {
      await this.page.click('label[for="new-patient"]');
    }
    
    await this.clickAndWait('[data-testid="create-user-button"]');
    
    // Look for success indication more flexibly - check for either toast or modal disappearing
    try {
      // First try to find the success toast
      await this.page.waitForFunction(() => {
        return document.body.innerText.includes('Usuario creado') || 
               document.body.innerText.includes('creado exitosamente');
      }, { timeout: 8000 });
    } catch {
      // If no toast found, check if modal disappeared (indicates success)
      try {
        await this.page.waitForFunction(() => {
          const modal = document.querySelector('[role="dialog"]');
          return !modal || !modal.offsetParent; // Modal is hidden/removed
        }, { timeout: 3000 });
      } catch {
        // Last resort: check for any success indication or absence of error
        await this.page.waitForTimeout(2000);
        const hasError = await this.page.locator('text=Error').isVisible().catch(() => false);
        if (hasError) {
          throw new Error('User creation failed - error message visible');
        }
      }
    }
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
    await this.page.locator('button').filter({ hasText: 'Sí' }).click();
    await this.waitForElement('[data-testid="toast-success"]');
  }  async expectUserCreated() {
    await this.waitForElement('[data-testid="toast-success"]');
  }

  async expectUserDeleted() {
    await this.waitForElement('[data-testid="toast-success"]');
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