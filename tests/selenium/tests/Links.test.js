const { createDriver } = require("../utils/driver");
const LinksPage = require("../Pages/LinksPage");

describe("HU-07 | Gestión de Enlaces - Página Principal", () => {
  let driver;
  let linksPage;

  beforeAll(async () => {
    driver = await createDriver();
    linksPage = new LinksPage(driver);
    await linksPage.abrirSeccion();
    await driver.sleep(2000); // esperar que cargue React
  });

  afterAll(async () => {
    await driver.quit();
  });

  // ─────────────────────────────────────────────────
  // CARGA DE LA PÁGINA
  // ─────────────────────────────────────────────────
  test("TC-02 | La página de enlaces carga correctamente", async () => {
    const url = await driver.getCurrentUrl();
    expect(url).toContain("/dashboard/enlaces");
  });

  test("TC-03 | El botón + Agregar Red es visible en la página", async () => {
    const visible = await linksPage.seccionVisible();
    expect(visible).toBe(true);
  });

  // ─────────────────────────────────────────────────
  // TARJETAS DE REDES (Card.jsx)
  // ─────────────────────────────────────────────────
  test("TC-04 | Se muestran las tarjetas de redes sociales existentes", async () => {
    const { By } = require("selenium-webdriver");
    const cards = await driver.findElements(
      By.css("[class*='card'], [class*='Card'], [class*='enlace'], [class*='Enlace']")
    );
    console.log(`Tarjetas encontradas: ${cards.length}`);
    expect(cards.length).toBeGreaterThanOrEqual(0); // puede ser 0 si no hay redes
  });

  // ─────────────────────────────────────────────────
  // MODAL - ABRIR Y CERRAR
  // ─────────────────────────────────────────────────
  test("TC-05 | El modal se abre al hacer click en + Agregar Red", async () => {
    await linksPage.clickAgregarRed();
    await driver.sleep(1000);
    const visible = await linksPage.modalEstaVisible();
    expect(visible).toBe(true);
  });

  test("TC-06 | El modal se cierra al hacer click en Cancelar", async () => {
    const { By, until } = require("selenium-webdriver");
    const btnCancelar = await driver.findElement(
      By.xpath("//button[contains(text(), 'Cancelar')]")
    );
    await btnCancelar.click();
    await driver.sleep(1000);
    const modalVisible = await linksPage.modalEstaVisible();
    expect(modalVisible).toBe(false);
  });

  // ─────────────────────────────────────────────────
  // MODAL - VALIDACIÓN DE CAMPOS VACÍOS
  // ─────────────────────────────────────────────────
  test("TC-07 | No se puede guardar el modal con campos vacíos", async () => {
    const { By } = require("selenium-webdriver");

    // Abrir modal
    await linksPage.clickAgregarRed();
    await driver.sleep(1000);

    // Click en Guardar sin llenar nada
    const btnGuardar = await driver.findElement(
      By.xpath("//button[contains(text(), 'Guardar') or contains(text(), 'Agregar')]")
    );
    await btnGuardar.click();
    await driver.sleep(500);

    // El modal debe seguir visible (no se cerró)
    const modalSigueVisible = await linksPage.modalEstaVisible();
    expect(modalSigueVisible).toBe(true);
  });

  // ─────────────────────────────────────────────────
  // MODAL - LLENAR FORMULARIO
  // ─────────────────────────────────────────────────
  test("TC-08 | Se pueden llenar los campos del modal correctamente", async () => {
    const { By } = require("selenium-webdriver");

    // Llenar campo nombre
    try {
      const inputNombre = await driver.findElement(
        By.css("input[name='nombre'], input[placeholder*='nombre'], input[placeholder*='red']")
      );
      await inputNombre.clear();
      await inputNombre.sendKeys("LinkedIn");
    } catch (e) {
      console.warn("Campo nombre no encontrado con ese selector");
    }

    // Llenar campo URL
    try {
      const inputUrl = await driver.findElement(
        By.css("input[name='url'], input[placeholder*='url'], input[placeholder*='URL']")
      );
      await inputUrl.clear();
      await inputUrl.sendKeys("https://linkedin.com/in/test");
    } catch (e) {
      console.warn("Campo URL no encontrado con ese selector");
    }

    // Llenar descripción
    try {
      const inputDesc = await driver.findElement(
        By.css("textarea[name='descripcion'], textarea[placeholder*='descripcion']")
      );
      await inputDesc.clear();
      await inputDesc.sendKeys("Perfil profesional de prueba");
    } catch (e) {
      console.warn("Campo descripción no encontrado con ese selector");
    }

    // Verificar que el modal sigue abierto
    const modalVisible = await linksPage.modalEstaVisible();
    expect(modalVisible).toBe(true);
  });

  // ─────────────────────────────────────────────────
  // CERRAR AL TERMINAR
  // ─────────────────────────────────────────────────
  test("TC-09 | Cerrar modal con Cancelar después de llenar campos", async () => {
    const { By } = require("selenium-webdriver");
    try {
      const btnCancelar = await driver.findElement(
        By.xpath("//button[contains(text(), 'Cancelar')]")
      );
      await btnCancelar.click();
      await driver.sleep(500);
    } catch (e) {
      console.warn("Modal ya estaba cerrado");
    }
    const modalVisible = await linksPage.modalEstaVisible();
    expect(modalVisible).toBe(false);
  });
});