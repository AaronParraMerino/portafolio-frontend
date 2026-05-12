const { By } = require("selenium-webdriver");
const BasePage = require("./BasePage");

const URL = "https://creafolio-zeta.vercel.app/dashboard/enlaces";

// Selectores de la página
const SELECTORS = {
  // Botón + Agregar Red
  btnAgregarRed: By.xpath("//*[contains(text(), '+ Agregar Red') or contains(text(), 'Agregar Red')]"),

  // Modal
  modal: By.css("[class*='modal'], [class*='Modal'], [role='dialog']"),

  // Campos del modal
  inputNombreRed:  By.css("input[name='nombre'], input[placeholder*='nombre'], input[placeholder*='red']"),
  inputUrl:        By.css("input[name='url'], input[placeholder*='url'], input[placeholder*='URL']"),
  inputDescripcion: By.css("textarea[name='descripcion'], textarea[placeholder*='descripcion']"),

  // Botones del modal
  btnGuardar:  By.xpath("//button[contains(text(), 'Guardar') or contains(text(), 'Agregar')]"),
  btnCancelar: By.xpath("//button[contains(text(), 'Cancelar')]"),
};

class LinksPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // PASO 1: Navegar a la sección
  async abrirSeccion() {
    await this.navigateTo(URL);
    await this.driver.sleep(2000); // esperar que cargue React
  }

  // Verificar que la sección cargó correctamente
  async seccionVisible() {
    return await this.isElementVisible(SELECTORS.btnAgregarRed);
  }

  // PASO 2: Click en + Agregar Red
  async clickAgregarRed() {
    await this.clickElement(SELECTORS.btnAgregarRed);
  }

  // PASO 3: Verificar que el modal aparece
  async modalEstaVisible() {
    return await this.isElementVisible(SELECTORS.modal);
  }

  // Verificar campos del modal
  async campoNombreVisible() {
    return await this.isElementVisible(SELECTORS.inputNombreRed);
  }

  async campoUrlVisible() {
    return await this.isElementVisible(SELECTORS.inputUrl);
  }

  async campoDescripcionVisible() {
    return await this.isElementVisible(SELECTORS.inputDescripcion);
  }

  async btnGuardarVisible() {
    return await this.isElementVisible(SELECTORS.btnGuardar);
  }

  async btnCancelarVisible() {
    return await this.isElementVisible(SELECTORS.btnCancelar);
  }
}

module.exports = LinksPage;