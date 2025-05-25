export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path = '') {
    await this.page.goto(path);
  }

  async waitForLoadState() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}