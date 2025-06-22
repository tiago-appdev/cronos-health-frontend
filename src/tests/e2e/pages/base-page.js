export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }
  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    // Small wait for any immediate dynamic content
    await this.page.waitForTimeout(500);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async waitForElement(selector, options = {}) {
    return await this.page.waitForSelector(selector, { timeout: 10000, ...options });
  }

  async clickAndWait(selector, waitForSelector = null) {
    await this.page.click(selector);
    if (waitForSelector) {
      await this.waitForElement(waitForSelector);
    }
    await this.page.waitForTimeout(500); // Small delay for UI updates
  }

  async fillForm(fields) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.fill(selector, value);
    }
  }

  async expectToContainText(text) {
    await this.page.waitForFunction(
      text => document.body.innerText.includes(text),
      text
    );
  }
  async logout() {
    try {
      // Check if we're already logged out by looking for login elements
      const isLoggedOut = await this.page.locator('text=Iniciar Sesión').isVisible({ timeout: 1000 }).catch(() => false);
      if (isLoggedOut) {
        console.log('Already logged out');
        return;
      }

      // Try to find and click logout button
      const logoutButton = this.page.locator('text=Cerrar Sesión').first();
      if (await logoutButton.isVisible({ timeout: 2000 })) {
        await logoutButton.click();
        // Wait for navigation with a reasonable timeout
        await this.page.waitForURL('/', { timeout: 5000 });
      } else {
        console.warn('Logout button not found');
        // Force navigation to home page
        await this.page.goto('/');
      }
    } catch (error) {
      console.warn('Logout error:', error.message);
      // Fallback: just navigate to home page
      await this.page.goto('/');
    }
  }
}