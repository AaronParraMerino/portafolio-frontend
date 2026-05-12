const { until, By } = require("selenium-webdriver");

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(url) {
    await this.driver.get(url);
  }

  async waitForElement(locator, timeout = 10000) {
    return await this.driver.wait(
      until.elementLocated(locator),
      timeout,
      `Elemento no encontrado: ${locator}`
    );
  }

  async isElementVisible(locator) {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async clickElement(locator) {
    const element = await this.waitForElement(locator);
    await element.click();
  }

  async getElementText(locator) {
    const element = await this.waitForElement(locator);
    return await element.getText();
  }
}

module.exports = BasePage;