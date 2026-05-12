const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments("--start-maximized");
  options.addArguments("--disable-notifications");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: 10000,
    pageLoad: 30000,
  });

  return driver;
}

module.exports = { createDriver };