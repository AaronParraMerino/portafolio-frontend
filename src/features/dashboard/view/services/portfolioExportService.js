import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const MAX_CANVAS_HEIGHT = 26000;
const IMAGE_QUALITY = 0.96;
const PDF_PAGE = {
  width: 210,
  height: 297,
  margin: 10,
};
const PPTX_PAGE = {
  width: 13.333,
  height: 7.5,
  margin: 0.32,
};
const EMU_PER_INCH = 914400;
const EXPORT_BG = '#f8fafc';
const CAPTURE_TIMEOUT_MS = 28000;
const ASSET_TIMEOUT_MS = 4500;
const EXPORT_VIEW_WIDTH = 1160;
const INLINE_STYLE_PROPERTIES = [
  'alignItems',
  'backgroundColor',
  'backgroundImage',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderLeftColor',
  'borderLeftStyle',
  'borderLeftWidth',
  'borderRightColor',
  'borderRightStyle',
  'borderRightWidth',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStyle',
  'borderTopWidth',
  'boxShadow',
  'boxSizing',
  'color',
  'display',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'gap',
  'gridTemplateColumns',
  'justifyContent',
  'letterSpacing',
  'lineHeight',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'objectFit',
  'overflow',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'position',
  'textAlign',
  'textDecoration',
  'textTransform',
  'transform',
];

function slugify(value = 'portafolio') {
  return String(value || 'portafolio')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'portafolio';
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadText(content, fileName, type = 'text/html;charset=utf-8') {
  downloadBlob(new Blob([content], { type }), fileName);
}

function withTimeout(promise, ms, message) {
  let timer;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]).finally(() => {
    window.clearTimeout(timer);
  });
}

function waitAtMost(promise, ms) {
  let timer;

  return Promise.race([
    promise.catch(() => undefined),
    new Promise((resolve) => {
      timer = window.setTimeout(resolve, ms);
    }),
  ]).finally(() => {
    window.clearTimeout(timer);
  });
}

function canvasToBlob(canvas, type = 'image/png', quality = IMAGE_QUALITY) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('No se pudo preparar el archivo.'));
    }, type, quality);
  });
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function inchesToEmu(value) {
  return Math.round(value * EMU_PER_INCH);
}

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function hexToRgb(hex = '#ffffff') {
  const clean = String(hex || '#ffffff').replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map(char => `${char}${char}`).join('')
    : clean;

  if (!/^[0-9a-f]{6}$/i.test(full)) {
    return { r: 255, g: 255, b: 255 };
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map(value => clamp(value).toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(left, right, leftPercent = 50) {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  const weight = Math.max(0, Math.min(100, Number(leftPercent))) / 100;

  return rgbToHex({
    r: (a.r * weight) + (b.r * (1 - weight)),
    g: (a.g * weight) + (b.g * (1 - weight)),
    b: (a.b * weight) + (b.b * (1 - weight)),
  });
}

function getCssVar(element, name, fallback) {
  const value = getComputedStyle(element).getPropertyValue(name).trim();
  return value || fallback;
}

function buildExportTheme(element) {
  const cardBg = getCssVar(element, '--card-bg', '#ffffff');
  const accent = getCssVar(element, '--accent', '#0077b7');
  const text = getCssVar(element, '--text-color', '#111827');
  const muted = getCssVar(element, '--muted-text-color', mixHex(text, cardBg, 62));

  return {
    cardBg,
    accent,
    text,
    muted,
    softSurface: getCssVar(element, '--soft-surface-bg', mixHex(cardBg, accent, 92)),
    softHover: getCssVar(element, '--soft-surface-hover-bg', mixHex(cardBg, accent, 84)),
    softBorder: getCssVar(element, '--soft-border-color', mixHex(text, cardBg, 16)),
    github: getCssVar(element, '--github-link-color', '#24292f'),
  };
}

function injectExportStyles(clonedDocument, theme) {
  const style = clonedDocument.createElement('style');
  style.textContent = `
    * {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
    }

    .portfolio-export-mode .portfolio-export-target,
    .portfolio-export-mode .pf-card {
      --card-bg: ${theme.cardBg};
      --accent: ${theme.accent};
      --text-color: ${theme.text};
      --muted-text-color: ${theme.muted};
      --soft-surface-bg: ${theme.softSurface};
      --soft-surface-hover-bg: ${theme.softHover};
      --soft-border-color: ${theme.softBorder};
      --github-link-color: ${theme.github};
    }

    .portfolio-export-mode .portfolio-export-target {
      background: transparent !important;
    }

    .portfolio-export-mode iframe,
    .portfolio-export-mode video {
      display: none !important;
    }

    .portfolio-export-mode .proj-video-wrap::before,
    .portfolio-export-mode .prj-carousel-video-wrap::before {
      content: 'Video';
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: #111827;
      font: 700 13px sans-serif;
    }

    .portfolio-export-mode .pf-avatar {
      box-shadow: 0 0 0 8px ${mixHex(theme.accent, '#ffffff', 24)}, 0 22px 46px rgba(0,0,0,.28) !important;
    }

    .portfolio-export-mode .chip,
    .portfolio-export-mode .b-laboral,
    .portfolio-export-mode .pb-arch,
    .portfolio-export-mode .proj-year,
    .portfolio-export-mode .proj-link-demo,
    .portfolio-export-mode .proj-contribution,
    .portfolio-export-mode .prj-year-pill,
    .portfolio-export-mode .prj-proj-link-demo,
    .portfolio-export-mode .prj-card-contribution,
    .portfolio-export-mode .prj-pill-arch,
    .portfolio-export-mode .sk-level-badge,
    .portfolio-export-mode .sk-soft-level,
    .portfolio-export-mode .sk-meter-fill {
      background: ${theme.softSurface} !important;
      border-color: ${theme.softBorder} !important;
    }

    .portfolio-export-mode .pf-about-text,
    .portfolio-export-mode .about-text,
    .portfolio-export-mode .sk-item-desc,
    .portfolio-export-mode .sk-soft-desc,
    .portfolio-export-mode .exp-desc,
    .portfolio-export-mode .proj-desc,
    .portfolio-export-mode .prj-card-desc,
    .portfolio-export-mode .prj-detail-description,
    .portfolio-export-mode .prj-card-contribution p {
      color: ${theme.muted} !important;
    }
  `;

  clonedDocument.head.appendChild(style);
}

function hasUnsupportedColorFunction(value = '') {
  return /\bcolor-mix\s*\(|\bcolor\s*\(/i.test(String(value || ''));
}

function isUnsupportedStyleValue(value = '') {
  return hasUnsupportedColorFunction(value) || /\bvar\s*\(/i.test(String(value || ''));
}

function sanitizeUnsupportedColors(clonedDocument, theme) {
  const target = clonedDocument.querySelector('.portfolio-export-target');
  const nodes = target ? [target, ...target.querySelectorAll('*')] : [];

  nodes.forEach((node) => {
    const style = clonedDocument.defaultView.getComputedStyle(node);

    if (hasUnsupportedColorFunction(style.color)) {
      node.style.color = theme.text;
    }

    if (hasUnsupportedColorFunction(style.backgroundColor) || hasUnsupportedColorFunction(style.backgroundImage)) {
      node.style.backgroundColor = theme.softSurface;
      node.style.backgroundImage = 'none';
    }

    if (hasUnsupportedColorFunction(style.borderColor)) {
      node.style.borderColor = theme.softBorder;
    }

    ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor'].forEach((property) => {
      if (hasUnsupportedColorFunction(style[property])) {
        node.style[property] = theme.softBorder;
      }
    });

    if (hasUnsupportedColorFunction(style.boxShadow)) {
      node.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)';
    }

    if (hasUnsupportedColorFunction(style.textShadow)) {
      node.style.textShadow = 'none';
    }

    if (hasUnsupportedColorFunction(style.fill)) {
      node.style.fill = 'currentColor';
    }

    if (hasUnsupportedColorFunction(style.stroke)) {
      node.style.stroke = 'currentColor';
    }
  });
}

function stripExportClasses(root) {
  [root, ...root.querySelectorAll('*')].forEach((node) => {
    node.removeAttribute('class');
  });
}

function getFallbackStyleValue(property, theme) {
  if (property === 'color') return theme.text;
  if (property === 'fill' || property === 'stroke') return 'currentColor';
  if (property.includes('background-image') || property === 'filter' || property === 'backdrop-filter') return 'none';
  if (property.includes('background')) return theme.softSurface;
  if (property.includes('border') || property.includes('outline')) return theme.softBorder;
  if (property.includes('shadow')) return 'none';
  return '';
}

function sanitizeInlineStyleTree(root, theme) {
  [root, ...root.querySelectorAll('*')].forEach((node) => {
    const style = node.style;

    for (let index = style.length - 1; index >= 0; index -= 1) {
      const property = style[index];
      const value = style.getPropertyValue(property);

      if (!isUnsupportedStyleValue(value)) continue;

      const fallback = getFallbackStyleValue(property, theme);

      if (fallback) {
        style.setProperty(property, fallback);
      } else {
        style.removeProperty(property);
      }
    }
  });
}

function prepareInlinedClone(source, clone, assetMap, theme, width) {
  inlineComputedTree(source, clone, assetMap, theme);

  normalizeExportContent(clone);
  clone.style.width = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.margin = '0 auto';
  clone.querySelectorAll('script, iframe, video').forEach(node => node.remove());
  sanitizeInlineStyleTree(clone, theme);
  stripExportClasses(clone);
}

function normalizeExportContent(root) {
  const removeSelectors = [
    '.prj-card-actions',
    '.prj-card-toggle-details',
    '.prj-cover-expand-btn',
    '.prj-carousel-arrow',
    '.prj-carousel-dots',
    '.prj-carousel-counter',
    '.prj-details-panel',
    'button',
  ];

  root.querySelectorAll(removeSelectors.join(',')).forEach(node => node.remove());
  root.querySelectorAll('.prj-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.prj-carousel-track');
    const slides = [...carousel.querySelectorAll('.prj-carousel-slide')];

    if (track) {
      track.style.transform = 'none';
      track.style.width = '100%';
      track.style.height = '100%';
    }

    slides.slice(1).forEach(slide => slide.remove());
    if (slides[0]) {
      slides[0].style.position = 'relative';
      slides[0].style.width = '100%';
      slides[0].style.minWidth = '100%';
      slides[0].style.transform = 'none';
    }
  });

  root.querySelectorAll('.pf-card').forEach((node) => {
    node.style.width = '100%';
    node.style.maxWidth = '100%';
    node.style.height = 'auto';
    node.style.overflow = 'hidden';
  });
  root.querySelectorAll('.pf-hero').forEach((node) => {
    node.style.minHeight = '230px';
    node.style.height = '230px';
  });
  root.querySelectorAll('.pf-social').forEach((node) => {
    node.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
  });
  root.querySelectorAll('.sk-list, .sk-soft-grid, .exp-list, .prj-view-grid').forEach((node) => {
    node.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
  });
  root.querySelectorAll('.sk-view-card, .exp-card, .prj-card, .pf-sec').forEach((node) => {
    node.style.height = 'auto';
    node.style.minHeight = '0';
  });
  root.querySelectorAll('.prj-card-cover-wrap').forEach((node) => {
    node.style.height = '260px';
    node.style.minHeight = '260px';
  });

  root.querySelectorAll('[aria-expanded], [aria-controls], [tabindex]').forEach((node) => {
    node.removeAttribute('aria-expanded');
    node.removeAttribute('aria-controls');
    node.removeAttribute('tabindex');
  });
}

function extractUrl(value = '') {
  const match = String(value || '').match(/url\((["']?)(.*?)\1\)/i);
  return match?.[2] || '';
}

function isDataUrl(value = '') {
  return /^data:/i.test(String(value || ''));
}

function isFetchableAsset(url = '') {
  if (!url || isDataUrl(url) || /^blob:/i.test(url)) return false;
  return /^(https?:)?\/\//i.test(url) || url.startsWith('/');
}

async function fetchAssetAsDataUrl(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), ASSET_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function buildAssetMap(element) {
  const urls = new Set();

  [...element.querySelectorAll('img')].forEach((image) => {
    const url = image.currentSrc || image.src;
    if (isFetchableAsset(url)) urls.add(url);
  });

  [element, ...element.querySelectorAll('*')].forEach((node) => {
    const url = extractUrl(getComputedStyle(node).backgroundImage);
    if (isFetchableAsset(url)) urls.add(url);
  });

  const entries = await Promise.all([...urls].map(async (url) => [
    url,
    await fetchAssetAsDataUrl(url),
  ]));

  return new Map(entries);
}

function removeRiskyMedia(clonedDocument) {
  const target = clonedDocument.querySelector('.portfolio-export-target');
  if (!target) return;

  [...target.querySelectorAll('img')].forEach((image) => {
    image.style.visibility = 'hidden';
    image.removeAttribute('src');
    image.removeAttribute('srcset');
  });

  [target, ...target.querySelectorAll('*')].forEach((node) => {
    node.style.backgroundImage = 'none';
  });
}

function applyAssetMap(clonedDocument, assetMap, { removeMissing = false } = {}) {
  const target = clonedDocument.querySelector('.portfolio-export-target');
  const nodes = target ? [target, ...target.querySelectorAll('*')] : [];
  const images = target ? [...target.querySelectorAll('img')] : [];

  images.forEach((image) => {
    const url = image.currentSrc || image.src;

    if (!assetMap.has(url)) {
      if (removeMissing) {
        image.style.visibility = 'hidden';
        image.removeAttribute('src');
        image.removeAttribute('srcset');
      }
      return;
    }

    const dataUrl = assetMap.get(url);

    if (dataUrl) {
      image.src = dataUrl;
      image.removeAttribute('srcset');
      return;
    }

    image.style.visibility = 'hidden';
  });

  nodes.forEach((node) => {
    const url = extractUrl(clonedDocument.defaultView.getComputedStyle(node).backgroundImage);

    if (!assetMap.has(url)) {
      if (removeMissing && isFetchableAsset(url)) {
        node.style.backgroundImage = 'none';
      }
      return;
    }

    const dataUrl = assetMap.get(url);

    if (dataUrl) {
      node.style.backgroundImage = `url("${dataUrl}")`;
      return;
    }

    node.style.backgroundImage = 'none';
  });
}

async function waitForImages(element) {
  const images = [...element.querySelectorAll('img')];

  await Promise.allSettled(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (typeof image.decode === 'function') {
      return withTimeout(image.decode(), ASSET_TIMEOUT_MS, 'Imagen lenta.');
    }

    return new Promise((resolve) => {
      const timeout = window.setTimeout(resolve, ASSET_TIMEOUT_MS);
      image.onload = resolve;
      image.onerror = resolve;
      image.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      image.onerror = () => {
        window.clearTimeout(timeout);
        resolve();
      };
    });
  }));
}

async function waitForReady(element) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await waitForImages(element);
}

async function capturePortfolio(element, options = {}) {
  const { safeMode = false } = options;

  if (!element) {
    throw new Error('No se encontro el portafolio para descargar.');
  }

  await waitAtMost(waitForReady(element), 7000);

  const width = Math.max(EXPORT_VIEW_WIDTH, Math.ceil(element.scrollWidth || element.getBoundingClientRect().width));
  const height = Math.ceil(element.scrollHeight || element.getBoundingClientRect().height);
  const scale = safeMode
    ? 1
    : Math.max(1, Math.min(1.55, MAX_CANVAS_HEIGHT / Math.max(height, 1), window.devicePixelRatio || 1.25));
  const theme = buildExportTheme(element);
  const assetMap = safeMode
    ? new Map()
    : await waitAtMost(buildAssetMap(element), 8000) || new Map();

  return withTimeout(html2canvas(element, {
    backgroundColor: EXPORT_BG,
    scale,
    useCORS: !safeMode,
    allowTaint: false,
    logging: false,
    imageTimeout: safeMode ? 0 : 4500,
    width,
    height,
    windowWidth: Math.max(document.documentElement.scrollWidth, width),
    windowHeight: Math.max(document.documentElement.scrollHeight, height),
    scrollX: 0,
    scrollY: -window.scrollY,
    onclone: (clonedDocument) => {
      clonedDocument.body.classList.add('portfolio-export-mode');
      injectExportStyles(clonedDocument, theme);
      if (safeMode) {
        removeRiskyMedia(clonedDocument);
      } else {
        applyAssetMap(clonedDocument, assetMap, { removeMissing: true });
      }
      sanitizeUnsupportedColors(clonedDocument, theme);
    },
  }), CAPTURE_TIMEOUT_MS, 'La captura del portafolio tardo demasiado.');
}

async function capturePortfolioWithFallback(element) {
  try {
    return await captureSanitizedClone(element);
  } catch (sanitizedError) {
    try {
      return await capturePortfolio(element, { safeMode: true });
    } catch {
      throw sanitizedError;
    }
  }
}

function copyComputedStyles(source, target, assetMap, theme) {
  const computed = getComputedStyle(source);

  INLINE_STYLE_PROPERTIES.forEach((property) => {
    const value = computed[property];

    if (!value || isUnsupportedStyleValue(value)) return;

    target.style[property] = value;
  });

  target.style.transition = 'none';
  target.style.animation = 'none';
  target.style.caretColor = 'transparent';

  if (isUnsupportedStyleValue(computed.color)) {
    target.style.color = theme.text;
  }

  if (isUnsupportedStyleValue(computed.backgroundColor)) {
    target.style.backgroundColor = theme.softSurface;
  }

  const backgroundUrl = extractUrl(computed.backgroundImage);

  if (backgroundUrl) {
    const dataUrl = assetMap.get(backgroundUrl);
    target.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : 'none';
  }

  if (source.tagName === 'IMG') {
    const url = source.currentSrc || source.src;
    const dataUrl = assetMap.get(url);

    if (dataUrl) {
      target.src = dataUrl;
      target.removeAttribute('srcset');
      target.style.width = computed.width;
      target.style.height = computed.height;
      target.style.maxWidth = '100%';
      return;
    }

    target.style.visibility = 'hidden';
    target.removeAttribute('src');
    target.removeAttribute('srcset');
  }

  if (source.tagName === 'IFRAME' || source.tagName === 'VIDEO') {
    target.remove();
  }
}

function inlineComputedTree(sourceRoot, targetRoot, assetMap, theme) {
  copyComputedStyles(sourceRoot, targetRoot, assetMap, theme);

  const sourceChildren = [...sourceRoot.children];
  const targetChildren = [...targetRoot.children];

  sourceChildren.forEach((sourceChild, index) => {
    const targetChild = targetChildren[index];
    if (!targetChild) return;
    inlineComputedTree(sourceChild, targetChild, assetMap, theme);
  });
}

async function captureSanitizedClone(element) {
  if (!element) {
    throw new Error('No se encontro el portafolio para descargar.');
  }

  const theme = buildExportTheme(element);
  const assetMap = await waitAtMost(buildAssetMap(element), 8000) || new Map();
  const width = Math.max(EXPORT_VIEW_WIDTH, Math.ceil(element.scrollWidth || element.getBoundingClientRect().width));
  const clone = element.cloneNode(true);
  const host = document.createElement('div');

  host.style.position = 'absolute';
  host.style.left = '0';
  host.style.top = '0';
  host.style.width = `${width}px`;
  host.style.background = EXPORT_BG;
  host.style.padding = '0';
  host.style.margin = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-1';
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    prepareInlinedClone(element, clone, assetMap, theme, width);

    const height = Math.ceil(clone.scrollHeight || clone.getBoundingClientRect().height);
    const scale = Math.max(1, Math.min(1.5, MAX_CANVAS_HEIGHT / Math.max(height, 1)));

    return await withTimeout(html2canvas(clone, {
      backgroundColor: EXPORT_BG,
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 0,
      width,
      height,
      windowWidth: width,
      windowHeight: Math.max(height, window.innerHeight),
      scrollX: 0,
      scrollY: 0,
    }), CAPTURE_TIMEOUT_MS, 'La captura segura del portafolio tardo demasiado.');
  } finally {
    host.remove();
  }
}

async function exportImage(canvas, format, baseName) {
  const blob = await canvasToBlob(canvas, 'image/png');

  downloadBlob(blob, `${baseName}.${format}`);
}

function cleanText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function textFrom(node, selector) {
  return cleanText(node?.querySelector(selector)?.textContent);
}

function extractPortfolioDocument(element) {
  if (!element) throw new Error('No se encontro el portafolio para descargar.');

  const identity = element.querySelector('.pf-identity');
  const contact = [...(identity?.querySelectorAll('.pf-contact-item') || [])].map(node => cleanText(node.textContent));
  const social = [...(identity?.querySelectorAll('.pf-soc-btn') || [])].map(node => ({
    name: textFrom(node, '.pf-soc-name'),
    url: textFrom(node, '.pf-soc-url'),
  }));
  const stats = [...element.querySelectorAll('.pf-stat')].map(node => ({
    value: textFrom(node, '.pf-stat-num'),
    label: textFrom(node, '.pf-stat-label'),
  }));
  const skills = [...element.querySelectorAll('.sk-view-card')].map(node => ({
    name: textFrom(node, '.sk-view-name'),
    level: textFrom(node, '.sk-level-badge'),
    description: textFrom(node, '.sk-view-desc'),
    percentage: textFrom(node, '.sk-view-pct'),
    type: node.classList.contains('is-soft') ? 'Blanda' : 'Tecnica',
  }));
  const experiences = [...element.querySelectorAll('.exp-card')].map(node => ({
    role: textFrom(node, '.exp-role'),
    organization: textFrom(node, '.exp-org'),
    dates: textFrom(node, '.exp-dates'),
    description: textFrom(node, '.exp-desc'),
    type: textFrom(node, '.tl-badge'),
    current: textFrom(node, '.b-current'),
  }));
  const projects = [...element.querySelectorAll('.prj-view-grid > .prj-card')].map(node => ({
    title: textFrom(node, '.prj-card-title'),
    description: textFrom(node, '.prj-card-desc'),
    contribution: textFrom(node, '.prj-card-contribution p'),
    badges: [...node.querySelectorAll('.prj-proj-badges .prj-pill')].map(item => cleanText(item.textContent)),
    technologies: [...node.querySelectorAll('.prj-stack-tags .prj-tech-chip-label')].map(item => cleanText(item.textContent)),
    links: [...node.querySelectorAll('.prj-proj-links a')].map(item => item.href).filter(Boolean),
    year: textFrom(node, '.prj-year-pill'),
  }));

  return {
    name: textFrom(identity, '.pf-name') || 'Portafolio profesional',
    role: textFrom(identity, '.pf-role'),
    location: textFrom(identity, '.pf-location span'),
    bio: textFrom(identity, '.pf-about-text'),
    avatarUrl: element.querySelector('.pf-avatar-img')?.currentSrc
      || element.querySelector('.pf-avatar-img')?.src
      || '',
    contact,
    social,
    stats,
    skills,
    experiences,
    projects,
  };
}

function exportPdf(documentData, baseName) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const accent = [0, 119, 183];
  const navy = [12, 26, 46];
  const muted = [91, 103, 120];
  const margin = 16;
  const width = PDF_PAGE.width - (margin * 2);
  let y = 18;
  let page = 1;

  const footer = () => {
    pdf.setDrawColor(221, 228, 236);
    pdf.line(margin, 284, PDF_PAGE.width - margin, 284);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...muted);
    pdf.text(documentData.name, margin, 290);
    pdf.text(String(page), PDF_PAGE.width - margin, 290, { align: 'right' });
  };
  const nextPage = () => {
    footer();
    pdf.addPage();
    page += 1;
    pdf.setFillColor(...navy);
    pdf.rect(0, 0, PDF_PAGE.width, 13, 'F');
    pdf.setFillColor(...accent);
    pdf.rect(0, 13, PDF_PAGE.width, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(documentData.name, margin, 8.5);
    y = 23;
  };
  const ensure = (height) => {
    if (y + height > 279) nextPage();
  };
  const sectionTitle = (title) => {
    ensure(18);
    y += 4;
    pdf.setFillColor(...accent);
    pdf.roundedRect(margin, y, 4, 9, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(...navy);
    pdf.text(title, margin + 9, y + 7);
    y += 15;
  };
  const card = ({ title, meta = '', description = '', tags = [], links = [] }) => {
    const body = pdf.splitTextToSize(description, width - 14).slice(0, 5);
    const height = Math.max(25, 18 + (body.length * 4.5) + (tags.length ? 9 : 0) + (links.length ? 7 : 0));
    ensure(height + 5);
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(218, 226, 235);
    pdf.roundedRect(margin, y, width, height, 3, 3, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...navy);
    pdf.text(title || 'Sin titulo', margin + 7, y + 8);
    if (meta) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...accent);
      pdf.text(pdf.splitTextToSize(meta, width - 14)[0], margin + 7, y + 14);
    }
    if (body.length) {
      pdf.setFontSize(9);
      pdf.setTextColor(...muted);
      pdf.text(body, margin + 7, y + (meta ? 20 : 15));
    }
    if (tags.length) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...accent);
      pdf.text(pdf.splitTextToSize(tags.join('  |  '), width - 14)[0], margin + 7, y + height - (links.length ? 11 : 5));
    }
    if (links.length) {
      const link = links[0];
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...accent);
      const label = pdf.splitTextToSize(link, width - 14)[0];
      pdf.textWithLink(label, margin + 7, y + height - 4, { url: link });
    }
    y += height + 5;
  };

  pdf.setFillColor(...navy);
  pdf.rect(0, 0, PDF_PAGE.width, 76, 'F');
  pdf.setFillColor(...accent);
  pdf.rect(0, 70, PDF_PAGE.width, 6, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(27);
  pdf.setTextColor(255, 255, 255);
  pdf.text(pdf.splitTextToSize(documentData.name, width), margin, 31);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(13);
  pdf.setTextColor(194, 224, 240);
  pdf.text(documentData.role || 'Portafolio profesional', margin, 49);
  pdf.setFontSize(9.5);
  pdf.text([documentData.location, ...documentData.contact].filter(Boolean).join('  |  '), margin, 61);
  y = 88;

  if (documentData.bio) {
    sectionTitle('Perfil profesional');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(...muted);
    const lines = pdf.splitTextToSize(documentData.bio, width);
    pdf.text(lines, margin, y);
    y += (lines.length * 5) + 7;
  }
  if (documentData.stats.length) {
    ensure(26);
    const statWidth = width / documentData.stats.length;
    documentData.stats.forEach((stat, index) => {
      const x = margin + (statWidth * index);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(...accent);
      pdf.text(stat.value, x + (statWidth / 2), y + 7, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text(stat.label, x + (statWidth / 2), y + 14, { align: 'center' });
    });
    y += 23;
  }
  if (documentData.skills.length) {
    sectionTitle('Habilidades');
    documentData.skills.forEach(skill => card({
      title: skill.name,
      meta: [skill.type, skill.level, skill.percentage].filter(Boolean).join(' - '),
      description: skill.description,
    }));
  }
  if (documentData.experiences.length) {
    sectionTitle('Experiencia');
    documentData.experiences.forEach(item => card({
      title: item.role,
      meta: [item.organization, item.type, item.dates, item.current].filter(Boolean).join(' - '),
      description: item.description,
    }));
  }
  if (documentData.projects.length) {
    sectionTitle('Proyectos');
    documentData.projects.forEach(project => card({
      title: project.title,
      meta: [...project.badges, project.year].filter(Boolean).join(' - '),
      description: [project.description, project.contribution].filter(Boolean).join(' '),
      tags: project.technologies,
      links: project.links,
    }));
  }
  if (documentData.social.length) {
    sectionTitle('Enlaces profesionales');
    documentData.social.forEach(item => card({ title: item.name, description: item.url }));
  }

  footer();

  pdf.save(`${baseName}.pdf`);
}

function shape(text, x, y, w, h, options = {}) {
  const normalizedText = String(text || '')
    .split(/\n/)
    .map(line => cleanText(line))
    .filter(Boolean)
    .join('\n');
  return { text: normalizedText, x, y, w, h, ...options };
}

function buildPresentationSlides(data) {
  const slides = [];
  const titleShape = title => shape(title, 0.65, 0.35, 12, 0.55, { size: 25, bold: true, color: '0C1A2E' });
  const accentBar = () => shape('', 0.65, 1.02, 1.1, 0.08, { fill: '0077B7', line: '0077B7' });
  const pageNumber = number => shape(String(number), 12.15, 7.02, 0.45, 0.2, { size: 8, color: '64748B', align: 'right' });
  const contentHeader = title => [
    shape('', 0, 0, 0.16, PPTX_PAGE.height, { fill: '0077B7', line: '0077B7' }),
    titleShape(title),
    accentBar(),
    shape('CREAFOLIO', 10.65, 0.44, 1.9, 0.24, { size: 8.5, bold: true, color: '64748B', align: 'right' }),
  ];

  slides.push({ shapes: [
    shape('', 0, 0, PPTX_PAGE.width, PPTX_PAGE.height, { fill: '0C1A2E', line: '0C1A2E' }),
    shape('', 0.72, 0.75, 0.14, 4.85, { fill: '0077B7', line: '0077B7' }),
    shape('PORTAFOLIO PROFESIONAL', 1.18, 1.02, 5.8, 0.35, { size: 13, bold: true, color: '56B4E6' }),
    shape(data.name, 1.18, 1.55, 10.8, 1.15, { size: 32, bold: true, color: 'FFFFFF' }),
    shape(data.role || 'Perfil profesional', 1.18, 2.9, 9.4, 0.55, { size: 19, color: 'C2E0F0' }),
    shape(data.bio, 1.18, 3.75, 9.9, 1.35, { size: 13, color: 'E2E8F0' }),
    shape([data.location, ...data.contact].filter(Boolean).join('  |  '), 1.18, 5.55, 10.8, 0.4, { size: 10, color: '94A3B8' }),
    shape(new Date().getFullYear(), 1.18, 6.65, 2, 0.3, { size: 9, color: '64748B' }),
  ] });

  const overviewItems = [
    { label: 'Habilidades', value: data.skills.length, color: '0077B7' },
    { label: 'Experiencias', value: data.experiences.length, color: '0D9488' },
    { label: 'Proyectos', value: data.projects.length, color: '7C3AED' },
  ];
  const overviewShapes = contentHeader('Contenido de la presentacion');
  overviewItems.forEach((item, index) => {
    const x = 0.72 + (index * 4.08);
    overviewShapes.push(shape('', x, 1.58, 3.72, 2.12, { fill: 'F8FAFC', line: 'D8E2EC', radius: true }));
    overviewShapes.push(shape(String(item.value), x + 0.3, 1.95, 3.12, 0.62, { size: 31, bold: true, color: item.color, align: 'center' }));
    overviewShapes.push(shape(item.label, x + 0.3, 2.78, 3.12, 0.35, { size: 15, bold: true, color: '0C1A2E', align: 'center' }));
  });
  overviewShapes.push(shape('Esta presentacion resume exclusivamente la informacion que decidiste mostrar en tu portafolio.', 1.22, 4.45, 10.85, 0.72, { size: 14, color: '475569', align: 'center' }));
  overviewShapes.push(shape([data.role, data.location].filter(Boolean).join(' | '), 1.22, 5.45, 10.85, 0.35, { size: 11, bold: true, color: '0077B7', align: 'center' }));
  overviewShapes.push(pageNumber(slides.length + 1));
  slides.push({ shapes: overviewShapes });

  if (data.stats.length || data.social.length) {
    const shapes = contentHeader('Resumen profesional');
    data.stats.slice(0, 4).forEach((stat, index) => {
      const x = 0.7 + (index * 3.08);
      shapes.push(shape('', x, 1.42, 2.75, 1.25, { fill: 'F1F5F9', line: 'D8E2EC', radius: true }));
      shapes.push(shape(stat.value, x + 0.18, 1.65, 2.38, 0.42, { size: 23, bold: true, color: '0077B7', align: 'center' }));
      shapes.push(shape(stat.label, x + 0.18, 2.16, 2.38, 0.24, { size: 9, color: '64748B', align: 'center' }));
    });
    shapes.push(shape('Contacto y enlaces', 0.72, 3.15, 5.4, 0.4, { size: 16, bold: true, color: '0C1A2E' }));
    const lines = [...data.contact, ...data.social.map(item => `${item.name}: ${item.url}`)];
    shapes.push(shape(lines.join('\n'), 0.72, 3.7, 11.85, 2.55, { size: 12, color: '475569', fill: 'F8FAFC', line: 'D8E2EC', padding: 0.18 }));
    shapes.push(pageNumber(slides.length + 1));
    slides.push({ shapes });
  }

  for (let offset = 0; offset < data.skills.length; offset += 6) {
    const items = data.skills.slice(offset, offset + 6);
    const shapes = contentHeader('Habilidades');
    items.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 0.7 + (col * 6.15);
      const y = 1.4 + (row * 1.72);
      shapes.push(shape('', x, y, 5.82, 1.42, { fill: 'F8FAFC', line: 'D8E2EC', radius: true }));
      shapes.push(shape(item.name, x + 0.22, y + 0.18, 3.7, 0.3, { size: 14, bold: true, color: '0C1A2E' }));
      shapes.push(shape([item.type, item.level, item.percentage].filter(Boolean).join(' | '), x + 3.75, y + 0.18, 1.82, 0.28, { size: 8, bold: true, color: '0077B7', align: 'right' }));
      shapes.push(shape(item.description, x + 0.22, y + 0.65, 5.34, 0.5, { size: 9.5, color: '64748B' }));
    });
    shapes.push(pageNumber(slides.length + 1));
    slides.push({ shapes });
  }

  for (let offset = 0; offset < data.experiences.length; offset += 4) {
    const items = data.experiences.slice(offset, offset + 4);
    const shapes = contentHeader('Experiencia');
    items.forEach((item, index) => {
      const y = 1.38 + (index * 1.35);
      shapes.push(shape('', 0.7, y, 11.92, 1.12, { fill: index % 2 ? 'FFFFFF' : 'F8FAFC', line: 'D8E2EC', radius: true }));
      shapes.push(shape(item.role, 0.95, y + 0.16, 5.7, 0.3, { size: 14, bold: true, color: '0C1A2E' }));
      shapes.push(shape([item.organization, item.type].filter(Boolean).join(' | '), 0.95, y + 0.54, 5.7, 0.25, { size: 9.5, bold: true, color: '0077B7' }));
      shapes.push(shape(item.description, 6.75, y + 0.18, 4.1, 0.62, { size: 9, color: '64748B' }));
      shapes.push(shape([item.dates, item.current].filter(Boolean).join(' | '), 10.65, y + 0.18, 1.65, 0.25, { size: 8.5, color: '64748B', align: 'right' }));
    });
    shapes.push(pageNumber(slides.length + 1));
    slides.push({ shapes });
  }

  data.projects.forEach(project => {
    const shapes = contentHeader(project.title || 'Proyecto');
    shapes.push(shape(project.badges.join('  |  '), 0.72, 1.35, 7.6, 0.35, { size: 10, bold: true, color: '0077B7' }));
    shapes.push(shape(project.year, 10.65, 1.35, 1.9, 0.3, { size: 10, color: '64748B', align: 'right' }));
    shapes.push(shape(project.description, 0.72, 1.92, 7.55, 1.55, { size: 14, color: '334155', fill: 'F8FAFC', line: 'D8E2EC', padding: 0.18 }));
    shapes.push(shape('Tecnologias', 8.65, 1.92, 3.6, 0.3, { size: 12, bold: true, color: '0C1A2E' }));
    shapes.push(shape(project.technologies.join('\n'), 8.65, 2.38, 3.55, 1.45, { size: 11, color: '0077B7', fill: 'EFF8FC', line: 'B9DFF2', padding: 0.16 }));
    if (project.contribution) {
      shapes.push(shape('Aporte', 0.72, 3.82, 2, 0.3, { size: 12, bold: true, color: '0C1A2E' }));
      shapes.push(shape(project.contribution, 0.72, 4.25, 7.55, 1.05, { size: 11, color: '475569' }));
    }
    if (project.links.length) {
      shapes.push(shape('Enlaces', 8.65, 4.18, 3.5, 0.3, { size: 12, bold: true, color: '0C1A2E' }));
      shapes.push(shape(project.links.map(compactUrl).join('\n'), 8.65, 4.62, 3.55, 1.15, { size: 9.5, color: '0077B7' }));
    }
    shapes.push(shape('Proyecto incluido segun la visibilidad configurada en el portafolio.', 0.72, 6.52, 9.8, 0.25, { size: 8.5, color: '94A3B8' }));
    shapes.push(pageNumber(slides.length + 1));
    slides.push({ shapes });
  });

  slides.push({ shapes: [
    shape('', 0, 0, PPTX_PAGE.width, PPTX_PAGE.height, { fill: '0C1A2E', line: '0C1A2E' }),
    shape('Gracias', 0.8, 1.25, 11.7, 0.8, { size: 34, bold: true, color: 'FFFFFF', align: 'center' }),
    shape(data.name, 0.8, 2.25, 11.7, 0.55, { size: 20, bold: true, color: '56B4E6', align: 'center' }),
    shape(data.role, 0.8, 2.95, 11.7, 0.4, { size: 14, color: 'C2E0F0', align: 'center' }),
    shape([...data.contact, ...data.social.map(item => `${item.name}: ${item.url}`)].join('\n'), 2.1, 4.05, 9.1, 1.65, { size: 11, color: 'E2E8F0', align: 'center' }),
    shape('Documento generado a partir de la informacion visible del portafolio.', 1.4, 6.55, 10.5, 0.25, { size: 8.5, color: '64748B', align: 'center' }),
  ] });

  return slides;
}

function wrapCanvasText(ctx, text, maxWidth, maxLines = Infinity) {
  const words = cleanText(text).split(' ').filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    const visible = lines.slice(0, maxLines);
    visible[maxLines - 1] = `${visible[maxLines - 1].replace(/[.,;:]?$/, '')}...`;
    return visible;
  }
  return lines;
}

function drawCanvasLines(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const lines = wrapCanvasText(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + (index * lineHeight)));
  return y + (lines.length * lineHeight);
}

function fitCanvasText(ctx, text, maxWidth) {
  const value = cleanText(text);
  if (ctx.measureText(value).width <= maxWidth) return value;

  let output = value;
  while (output.length > 3 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function compactUrl(value = '') {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return cleanText(value).replace(/^https?:\/\//, '').split('/')[0];
  }
}

async function loadCanvasImage(url) {
  if (!url) return null;
  const source = isDataUrl(url) ? url : await fetchAssetAsDataUrl(url);
  if (!source) return null;

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

async function exportCvImage(data, baseName) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  const sidebarWidth = 360;
  const rightX = 420;
  const rightWidth = 760;
  const navy = '#0c1a2e';
  const accent = '#0077b7';
  const muted = '#5b6778';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = navy;
  ctx.fillRect(0, 0, sidebarWidth, canvas.height);
  ctx.fillStyle = accent;
  ctx.fillRect(sidebarWidth, 0, 12, canvas.height);

  const avatar = await loadCanvasImage(data.avatarUrl);
  ctx.save();
  ctx.beginPath();
  ctx.arc(180, 170, 104, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    const scale = Math.max(208 / avatar.width, 208 / avatar.height);
    const w = avatar.width * scale;
    const h = avatar.height * scale;
    ctx.drawImage(avatar, 180 - (w / 2), 170 - (h / 2), w, h);
  } else {
    ctx.fillStyle = '#e8f4fb';
    ctx.fillRect(76, 66, 208, 208);
    ctx.fillStyle = accent;
    ctx.font = '700 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.name.split(' ').map(part => part[0]).slice(0, 2).join(''), 180, 194);
  }
  ctx.restore();
  ctx.strokeStyle = '#56b4e6';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(180, 170, 108, 0, Math.PI * 2);
  ctx.stroke();

  const sidebarHeading = (label, y) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#56b4e6';
    ctx.font = '700 22px Arial';
    ctx.fillText(label.toUpperCase(), 42, y);
    ctx.fillStyle = '#56b4e6';
    ctx.fillRect(42, y + 15, 54, 4);
    return y + 50;
  };
  const sideItemCount = data.contact.length + (data.location ? 1 : 0)
    + Math.min(data.skills.length, 10)
    + Math.min(data.social.length, 5);
  const sideGapBoost = Math.max(0, Math.min(22, (1450 - (sideItemCount * 56)) / Math.max(sideItemCount, 1) - 34));
  const mainItemCount = Math.min(data.experiences.length, 4) + Math.min(data.projects.length, 3);
  const estimatedMainHeight = 470 + (Math.min(data.experiences.length, 4) * 120) + (Math.min(data.projects.length, 3) * 112);
  const mainGapBoost = Math.max(0, Math.min(58, (1510 - estimatedMainHeight) / Math.max(mainItemCount + 2, 1)));

  let sideY = sidebarHeading('Contacto', 330);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '400 18px Arial';
  data.contact.concat(data.location ? [data.location] : []).forEach((item) => {
    sideY = drawCanvasLines(ctx, item, 42, sideY, 275, 25, 2) + 18 + sideGapBoost;
  });
  sideY = sidebarHeading('Habilidades', sideY + 18);
  data.skills.slice(0, 10).forEach((skill) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px Arial';
    ctx.fillText(skill.name, 42, sideY);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 15px Arial';
    ctx.fillText([skill.level, skill.percentage].filter(Boolean).join(' | '), 42, sideY + 24);
    sideY += 62 + sideGapBoost;
  });
  if (data.social.length && sideY < 1530) {
    sideY = sidebarHeading('Enlaces', sideY + 10);
    data.social.slice(0, 5).forEach((item) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 16px Arial';
      ctx.fillText(fitCanvasText(ctx, item.name, 275), 42, sideY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 13px Arial';
      ctx.fillText(fitCanvasText(ctx, compactUrl(item.url), 275), 42, sideY + 22);
      sideY += 54 + sideGapBoost;
    });
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = navy;
  ctx.font = '700 48px Arial';
  let mainY = drawCanvasLines(ctx, data.name, rightX, 105, rightWidth, 55, 2);
  ctx.fillStyle = accent;
  ctx.font = '700 24px Arial';
  mainY = drawCanvasLines(ctx, data.role || 'Perfil profesional', rightX, mainY + 14, rightWidth, 30, 2) + 26;
  ctx.fillStyle = accent;
  ctx.fillRect(rightX, mainY, 90, 7);
  mainY += 52;

  const mainHeading = (label) => {
    ctx.fillStyle = navy;
    ctx.font = '700 25px Arial';
    ctx.fillText(label.toUpperCase(), rightX, mainY);
    ctx.strokeStyle = '#d8e2ec';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, mainY + 14);
    ctx.lineTo(rightX + rightWidth, mainY + 14);
    ctx.stroke();
    mainY += 48;
  };
  const entry = (title, meta, description, maxLines = 3) => {
    ctx.fillStyle = navy;
    ctx.font = '700 20px Arial';
    mainY = drawCanvasLines(ctx, title, rightX, mainY, rightWidth, 25, 2);
    ctx.fillStyle = accent;
    ctx.font = '700 15px Arial';
    mainY = drawCanvasLines(ctx, meta, rightX, mainY + 5, rightWidth, 21, 2);
    if (description) {
      ctx.fillStyle = muted;
      ctx.font = '400 16px Arial';
      mainY = drawCanvasLines(ctx, description, rightX, mainY + 8, rightWidth, 23, maxLines);
    }
    mainY += 24 + mainGapBoost;
  };

  if (data.bio) {
    mainHeading('Perfil profesional');
    ctx.fillStyle = muted;
    ctx.font = '400 18px Arial';
    mainY = drawCanvasLines(ctx, data.bio, rightX, mainY, rightWidth, 27, 7) + 34;
  }
  if (data.experiences.length && mainY < 1480) {
    mainHeading('Experiencia');
    data.experiences.slice(0, 4).forEach(item => {
      if (mainY < 1500) entry(item.role, [item.organization, item.dates].filter(Boolean).join(' | '), item.description, 3);
    });
  }
  if (data.projects.length && mainY < 1480) {
    mainHeading('Proyectos destacados');
    data.projects.slice(0, 3).forEach(project => {
      if (mainY < 1530) entry(project.title, project.technologies.slice(0, 6).join(' | '), project.description, 2);
    });
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 13px Arial';
  ctx.fillText('CV generado con la informacion visible del portafolio.', rightX, 1695);

  const blob = await canvasToBlob(canvas, 'image/png');
  downloadBlob(blob, `${baseName}-cv.png`);
}

async function exportPortfolioImage(data, baseName, theme) {
  const width = 1400;
  const columns = 2;
  const skillRows = Math.ceil(data.skills.length / columns);
  const experienceRows = Math.ceil(data.experiences.length / columns);
  const projectRows = Math.ceil(data.projects.length / columns);
  const height = Math.max(1500, 610 + (skillRows * 190) + (experienceRows * 235) + (projectRows * 285));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const margin = 82;
  const contentWidth = width - (margin * 2);
  const gap = 28;
  const cardWidth = (contentWidth - gap) / 2;
  const heroColor = theme.hero || '#0c1a2e';

  ctx.fillStyle = theme.cardBg || '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = heroColor;
  ctx.fillRect(0, 0, width, 330);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 320, width, 10);

  const avatar = await loadCanvasImage(data.avatarUrl);
  ctx.save();
  ctx.beginPath();
  ctx.arc(190, 166, 105, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#e8f4fb';
  ctx.fillRect(85, 61, 210, 210);
  if (avatar) {
    const scale = Math.max(210 / avatar.width, 210 / avatar.height);
    const imageWidth = avatar.width * scale;
    const imageHeight = avatar.height * scale;
    ctx.drawImage(avatar, 190 - (imageWidth / 2), 166 - (imageHeight / 2), imageWidth, imageHeight);
  }
  ctx.restore();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(190, 166, 109, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 52px Arial';
  ctx.fillText(fitCanvasText(ctx, data.name, 920), 350, 128);
  ctx.fillStyle = '#c2e0f0';
  ctx.font = '700 26px Arial';
  ctx.fillText(fitCanvasText(ctx, data.role || 'Portafolio profesional', 920), 350, 178);
  ctx.fillStyle = '#dbeafe';
  ctx.font = '400 18px Arial';
  drawCanvasLines(ctx, [data.location, ...data.contact].filter(Boolean).join('  |  '), 350, 222, 920, 26, 2);

  let y = 390;
  const section = (title) => {
    ctx.fillStyle = theme.accent;
    ctx.fillRect(margin, y - 27, 7, 36);
    ctx.fillStyle = theme.text;
    ctx.font = '700 28px Arial';
    ctx.fillText(title.toUpperCase(), margin + 20, y);
    y += 42;
  };
  const drawCard = (item, x, cardY, cardHeight) => {
    ctx.fillStyle = theme.softSurface;
    ctx.strokeStyle = theme.softBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, cardY, cardWidth, cardHeight, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.font = '700 21px Arial';
    ctx.fillText(fitCanvasText(ctx, item.title, cardWidth - 42), x + 22, cardY + 38);
    ctx.fillStyle = theme.accent;
    ctx.font = '700 14px Arial';
    ctx.fillText(fitCanvasText(ctx, item.meta, cardWidth - 42), x + 22, cardY + 68);
    ctx.fillStyle = theme.muted;
    ctx.font = '400 16px Arial';
    drawCanvasLines(ctx, item.description, x + 22, cardY + 100, cardWidth - 44, 23, item.lines || 4);
  };

  if (data.bio) {
    section('Perfil profesional');
    ctx.fillStyle = theme.muted;
    ctx.font = '400 19px Arial';
    y = drawCanvasLines(ctx, data.bio, margin, y, contentWidth, 29, 7) + 42;
  }
  if (data.stats.length) {
    const statWidth = contentWidth / data.stats.length;
    data.stats.forEach((stat, index) => {
      const center = margin + (statWidth * index) + (statWidth / 2);
      ctx.fillStyle = theme.accent;
      ctx.font = '700 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, center, y);
      ctx.fillStyle = theme.muted;
      ctx.font = '700 13px Arial';
      ctx.fillText(stat.label.toUpperCase(), center, y + 28);
    });
    ctx.textAlign = 'left';
    y += 78;
  }
  if (data.skills.length) {
    section('Habilidades');
    data.skills.forEach((skill, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      drawCard({ title: skill.name, meta: [skill.type, skill.level, skill.percentage].filter(Boolean).join(' | '), description: skill.description, lines: 3 }, margin + (col * (cardWidth + gap)), y + (row * 175), 150);
    });
    y += skillRows * 175 + 28;
  }
  if (data.experiences.length) {
    section('Experiencia');
    data.experiences.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      drawCard({ title: item.role, meta: [item.organization, item.dates].filter(Boolean).join(' | '), description: item.description, lines: 5 }, margin + (col * (cardWidth + gap)), y + (row * 215), 190);
    });
    y += experienceRows * 215 + 28;
  }
  if (data.projects.length) {
    section('Proyectos');
    data.projects.forEach((project, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      drawCard({ title: project.title, meta: project.technologies.slice(0, 7).join(' | '), description: [project.description, project.contribution].filter(Boolean).join(' '), lines: 6 }, margin + (col * (cardWidth + gap)), y + (row * 265), 240);
    });
  }

  const blob = await canvasToBlob(canvas, 'image/png');
  downloadBlob(blob, `${baseName}.png`);
}

async function exportPptx(documentData, baseName) {
  const slides = buildPresentationSlides(documentData);
  const blob = await buildPptxBlob(slides, baseName);
  downloadBlob(blob, `${baseName}.pptx`);
}

async function buildPptxBlob(slides, title) {
  const zip = new JSZip();
  const slideWidth = inchesToEmu(PPTX_PAGE.width);
  const slideHeight = inchesToEmu(PPTX_PAGE.height);
  const now = new Date().toISOString();

  zip.file('[Content_Types].xml', buildContentTypes(slides.length));
  zip.folder('_rels').file('.rels', buildRootRels());
  zip.folder('docProps').file('app.xml', buildAppXml(slides.length));
  zip.folder('docProps').file('core.xml', buildCoreXml(title, now));

  const ppt = zip.folder('ppt');
  ppt.file('presentation.xml', buildPresentationXml(slides.length, slideWidth, slideHeight));
  ppt.folder('_rels').file('presentation.xml.rels', buildPresentationRels(slides.length));
  ppt.folder('theme').file('theme1.xml', buildThemeXml());
  ppt.folder('slideMasters').file('slideMaster1.xml', buildSlideMasterXml());
  ppt.folder('slideMasters').folder('_rels').file('slideMaster1.xml.rels', buildSlideMasterRels());
  ppt.folder('slideLayouts').file('slideLayout1.xml', buildSlideLayoutXml());
  ppt.folder('slideLayouts').folder('_rels').file('slideLayout1.xml.rels', buildSlideLayoutRels());

  const slidesFolder = ppt.folder('slides');
  const slideRelsFolder = slidesFolder.folder('_rels');
  slides.forEach((slide, index) => {
    const slideNumber = index + 1;
    slidesFolder.file(`slide${slideNumber}.xml`, buildSlideXml(slide, slideWidth, slideHeight));
    slideRelsFolder.file(`slide${slideNumber}.xml.rels`, buildSlideRels(slideNumber));
  });

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    compression: 'DEFLATE',
  });
}

function buildContentTypes(slideCount) {
  const slideOverrides = Array.from({ length: slideCount }, (_, index) => (
    `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  ${slideOverrides}
</Types>`;
}

function buildRootRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function buildAppXml(slideCount) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Portafolio</Application>
  <PresentationFormat>16:9 Widescreen</PresentationFormat>
  <Slides>${slideCount}</Slides>
</Properties>`;
}

function buildCoreXml(title, now) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Portafolio</dc:creator>
  <cp:lastModifiedBy>Portafolio</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
}

function buildPresentationXml(slideCount, width, height) {
  const slideIds = Array.from({ length: slideCount }, (_, index) => (
    `<p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>${slideIds}</p:sldIdLst>
  <p:sldSz cx="${width}" cy="${height}" type="custom"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;
}

function buildPresentationRels(slideCount) {
  const slideRels = Array.from({ length: slideCount }, (_, index) => (
    `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${slideRels}
</Relationships>`;
}

function buildTextParagraphs(text, options) {
  const lines = String(text || '').split(/\n/);
  return lines.map(line => `<a:p><a:pPr algn="${options.align === 'center' ? 'ctr' : options.align === 'right' ? 'r' : 'l'}"/><a:r><a:rPr lang="es-BO" sz="${Math.round((options.size || 12) * 100)}" b="${options.bold ? 1 : 0}"><a:solidFill><a:srgbClr val="${options.color || '334155'}"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>${escapeXml(line)}</a:t></a:r><a:endParaRPr lang="es-BO"/></a:p>`).join('');
}

function buildEditableShape(item, index) {
  const geometry = item.radius ? 'roundRect' : 'rect';
  const fill = item.fill
    ? `<a:solidFill><a:srgbClr val="${item.fill}"/></a:solidFill>`
    : '<a:noFill/>';
  const line = item.line
    ? `<a:ln w="9525"><a:solidFill><a:srgbClr val="${item.line}"/></a:solidFill></a:ln>`
    : '<a:ln><a:noFill/></a:ln>';
  const padding = inchesToEmu(item.padding ?? 0.04);

  return `<p:sp>
    <p:nvSpPr><p:cNvPr id="${index + 2}" name="Elemento ${index + 1}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
    <p:spPr><a:xfrm><a:off x="${inchesToEmu(item.x)}" y="${inchesToEmu(item.y)}"/><a:ext cx="${inchesToEmu(item.w)}" cy="${inchesToEmu(item.h)}"/></a:xfrm><a:prstGeom prst="${geometry}"><a:avLst/></a:prstGeom>${fill}${line}</p:spPr>
    <p:txBody><a:bodyPr wrap="square" lIns="${padding}" rIns="${padding}" tIns="${padding}" bIns="${padding}" anchor="${item.valign === 'middle' ? 'ctr' : 't'}"/><a:lstStyle/>${buildTextParagraphs(item.text, item)}</p:txBody>
  </p:sp>`;
}

function buildSlideXml(slide, width, height) {
  const editableShapes = (slide.shapes || []).map(buildEditableShape).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="F8FAFC"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/><a:chOff x="0" y="0"/><a:chExt cx="${width}" cy="${height}"/></a:xfrm></p:grpSpPr>
      ${editableShapes}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function buildSlideRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;
}

function buildSlideMasterXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle><a:lvl1pPr algn="l"><a:defRPr sz="3200"><a:latin typeface="Arial"/></a:defRPr></a:lvl1pPr></p:titleStyle>
    <p:bodyStyle><a:lvl1pPr algn="l"><a:defRPr sz="1800"><a:latin typeface="Arial"/></a:defRPr></a:lvl1pPr></p:bodyStyle>
    <p:otherStyle><a:lvl1pPr algn="l"><a:defRPr sz="1800"><a:latin typeface="Arial"/></a:defRPr></a:lvl1pPr></p:otherStyle>
  </p:txStyles>
</p:sldMaster>`;
}

function buildSlideMasterRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
}

function buildSlideLayoutXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;
}

function buildSlideLayoutRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
}

function buildThemeXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Portafolio">
  <a:themeElements>
    <a:clrScheme name="Portafolio"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="374151"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="0077B7"/></a:accent1><a:accent2><a:srgbClr val="34D399"/></a:accent2><a:accent3><a:srgbClr val="FBBF24"/></a:accent3><a:accent4><a:srgbClr val="E85555"/></a:accent4><a:accent5><a:srgbClr val="7C3AED"/></a:accent5><a:accent6><a:srgbClr val="0891B2"/></a:accent6><a:hlink><a:srgbClr val="0077B7"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Portafolio"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Portafolio">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`;
}

async function buildFallbackHtml(element, title) {
  if (!element) {
    throw new Error('No se encontro el portafolio para descargar.');
  }

  await waitAtMost(waitForReady(element), 7000);

  const theme = buildExportTheme(element);
  const assetMap = await waitAtMost(buildAssetMap(element), 8000) || new Map();
  const clone = element.cloneNode(true);
  const cssText = [...document.styleSheets].map((sheet) => {
    try {
      return [...sheet.cssRules].map(rule => rule.cssText).join('\n');
    } catch {
      return '';
    }
  }).join('\n');

  const embedAssets = (source, target) => {
    if (source.tagName === 'IMG') {
      const url = source.currentSrc || source.src;
      const dataUrl = assetMap.get(url);
      if (dataUrl) {
        target.src = dataUrl;
        target.removeAttribute('srcset');
      }
    }

    const backgroundUrl = extractUrl(getComputedStyle(source).backgroundImage);
    if (backgroundUrl && assetMap.get(backgroundUrl)) {
      target.style.backgroundImage = `url("${assetMap.get(backgroundUrl)}")`;
    }

    [...source.children].forEach((sourceChild, index) => {
      if (target.children[index]) embedAssets(sourceChild, target.children[index]);
    });
  };

  embedAssets(element, clone);
  normalizeExportContent(clone);
  clone.style.width = '100%';
  clone.style.maxWidth = `${EXPORT_VIEW_WIDTH}px`;
  clone.style.minWidth = '0';
  clone.style.margin = '0 auto';

  const hero = getCssVar(element, '--hero-bg', '#0c1a2e');
  const avatar = getCssVar(element, '--avatar-bg', theme.accent);
  const font = getCssVar(element, '--pf-font', 'Arial, sans-serif');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeXml(title)}</title>
  <style>
    ${cssText}
    body {
      margin: 0;
      padding: 30px;
      background: ${EXPORT_BG};
      --hero-bg: ${hero};
      --avatar-bg: ${avatar};
      --accent: ${theme.accent};
      --card-bg: ${theme.cardBg};
      --text-color: ${theme.text};
      --muted-text-color: ${theme.muted};
      --soft-surface-bg: ${theme.softSurface};
      --soft-surface-hover-bg: ${theme.softHover};
      --soft-border-color: ${theme.softBorder};
      --pf-font: ${font};
      font-family: var(--pf-font);
      color: var(--text-color);
    }
    main {
      width: min(100%, ${EXPORT_VIEW_WIDTH}px);
      margin: 0 auto;
      overflow: hidden;
    }
    img { max-width: 100%; height: auto; }
    button, .prj-card-actions, .prj-details-panel { display: none !important; }
    @media (max-width: 700px) {
      body { padding: 12px; }
    }
  </style>
</head>
<body class="vw-page">
  <main class="page">
    ${clone.outerHTML}
  </main>
</body>
</html>`;
}

export async function exportPortfolio(element, { format, title = 'portafolio' }) {
  const baseName = slugify(`${title}-${new Date().toISOString().slice(0, 10)}`);

  if (format === 'html') {
    downloadText(await buildFallbackHtml(element, title), `${baseName}.html`);
    return;
  }

  if (format === 'cv') {
    await exportCvImage(extractPortfolioDocument(element), baseName);
    return;
  }

  if (format === 'png') {
    const theme = {
      ...buildExportTheme(element),
      hero: getCssVar(element, '--hero-bg', '#0c1a2e'),
    };

    try {
      await exportPortfolioImage(extractPortfolioDocument(element), baseName, theme);
    } catch {
      const canvas = await capturePortfolioWithFallback(element);
      await exportImage(canvas, format, baseName);
    }
    return;
  }

  if (format === 'pdf' || format === 'pptx') {
    try {
      const documentData = extractPortfolioDocument(element);

      if (format === 'pdf') {
        exportPdf(documentData, baseName);
      } else {
        await exportPptx(documentData, baseName);
      }
      return;
    } catch (error) {
      throw new Error(error?.message || 'No se pudo generar el documento solicitado.');
    }
  }

  throw new Error('Formato de descarga no soportado.');
}
