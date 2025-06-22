import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class AuthPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoLogin() {
    await this.goto('/login');
    await this.waitForElement(SELECTORS.form.email);
  }

  async gotoRegister() {
    await this.goto('/register');
    await this.waitForElement(SELECTORS.form.name);
  }

  async login(email, password) {
    await this.gotoLogin();    
    await this.fillForm({
      [SELECTORS.form.email]: email,
      [SELECTORS.form.password]: password
    });
    await this.clickAndWait(SELECTORS.form.submitButton);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000); // Wait for potential redirects
  }

  async register(userData) {
    await this.gotoRegister();
    
    await this.fillForm({
      [SELECTORS.form.name]: userData.name,
      [SELECTORS.form.email]: userData.email,
      [SELECTORS.form.password]: userData.password,
      [SELECTORS.form.confirmPassword]: userData.password
    });    // Select user type - target the Radix UI radio components properly
    if (userData.userType === 'doctor') {
      // For Radix UI RadioGroupItem, we need to click the label or use the data-slot attribute
      const doctorSelectors = [
        'label[for="doctor"]', // Click the label which will trigger the radio
        '[data-slot="radio-group-item"][value="doctor"]',
        'text=Médico',
        '#doctor'
      ];
      
      let clicked = false;
      for (const selector of doctorSelectors) {
        try {
          const element = this.page.locator(selector);
          await element.waitFor({ timeout: 2000 });
          await element.click({ force: true });
          clicked = true;
          console.log(`Successfully clicked doctor radio with selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`Failed to click doctor radio with selector ${selector}: ${error.message}`);
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('Could not select doctor radio button with any selector');
      }
    } else {
      // For patient radio button
      const patientSelectors = [
        'label[for="patient"]', // Click the label which will trigger the radio
        '[data-slot="radio-group-item"][value="patient"]',
        'text=Paciente',
        '#patient'
      ];
      
      let clicked = false;
      for (const selector of patientSelectors) {
        try {
          const element = this.page.locator(selector);
          await element.waitFor({ timeout: 2000 });
          await element.click({ force: true });
          clicked = true;
          console.log(`Successfully clicked patient radio with selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`Failed to click patient radio with selector ${selector}: ${error.message}`);
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('Could not select patient radio button with any selector');
      }
    }await this.clickAndWait(SELECTORS.form.submitButton);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000); // Wait for potential redirects
  }

  async expectLoginSuccess(userType) {
    if (userType === 'admin') {
      await this.page.waitForURL('/admin');
    } else {
      await this.page.waitForURL('/dashboard');
    }
  }

  async expectLoginError() {
    await this.waitForElement('text=Error de inicio de sesión');
  }

  async expectRegistrationSuccess() {
    await this.page.waitForURL('/dashboard');
  }
  // Debug helper to see what radio buttons are available
  async debugRadioButtons() {
    console.log('=== Radio Button Debug ===');
    
    // Check for Radix UI radio group items
    const radioGroupItems = await this.page.locator('[data-slot="radio-group-item"]').all();
    console.log(`Found ${radioGroupItems.length} radio group items`);
    
    for (let i = 0; i < radioGroupItems.length; i++) {
      const value = await radioGroupItems[i].getAttribute('value');
      const isVisible = await radioGroupItems[i].isVisible();
      const isEnabled = await radioGroupItems[i].isEnabled();
      console.log(`Radio group item ${i}: value="${value}", visible=${isVisible}, enabled=${isEnabled}`);
    }
    
    // Check for traditional radio inputs
    const radioInputs = await this.page.locator('input[type="radio"]').all();
    console.log(`Found ${radioInputs.length} traditional radio inputs`);
    
    for (let i = 0; i < radioInputs.length; i++) {
      const value = await radioInputs[i].getAttribute('value');
      const isVisible = await radioInputs[i].isVisible();
      const isEnabled = await radioInputs[i].isEnabled();
      console.log(`Radio input ${i}: value="${value}", visible=${isVisible}, enabled=${isEnabled}`);
    }
    
    // Check for labels that might trigger the radios
    const patientLabel = this.page.locator('label[for="patient"]');
    const doctorLabel = this.page.locator('label[for="doctor"]');
    
    console.log(`Patient label exists: ${await patientLabel.count() > 0}`);
    console.log(`Doctor label exists: ${await doctorLabel.count() > 0}`);
    
    if (await patientLabel.count() > 0) {
      console.log(`Patient label text: "${await patientLabel.textContent()}"`);
    }
    
    if (await doctorLabel.count() > 0) {
      console.log(`Doctor label text: "${await doctorLabel.textContent()}"`);
    }
  }
}