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
  'height',
  'justifyContent',
  'letterSpacing',
  'lineHeight',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxWidth',
  'minHeight',
  'minWidth',
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
  'width',
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

function canvasToJpegDataUrl(canvas, quality = IMAGE_QUALITY) {
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;

  const ctx = output.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.drawImage(canvas, 0, 0);

  return output.toDataURL('image/jpeg', quality);
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

function sliceCanvas(sourceCanvas, y, height) {
  const slice = document.createElement('canvas');
  const safeHeight = Math.min(height, sourceCanvas.height - y);

  slice.width = sourceCanvas.width;
  slice.height = safeHeight;

  const ctx = slice.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, slice.width, slice.height);
  ctx.drawImage(
    sourceCanvas,
    0,
    y,
    sourceCanvas.width,
    safeHeight,
    0,
    0,
    sourceCanvas.width,
    safeHeight
  );

  return slice;
}

function getPreferredBreaks(element, canvas) {
  const rootRect = element.getBoundingClientRect();
  const scaleY = canvas.height / Math.max(element.scrollHeight || rootRect.height, 1);
  const selectors = [
    '.pf-sec',
    '.pf-identity',
    '.pf-stats',
    '.pf-hero',
    '.subsec-divider',
    '.sk-view-card',
    '.exp-card',
    '.prj-card',
  ];

  return [...element.querySelectorAll(selectors.join(','))]
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return Math.max(0, Math.round((rect.top - rootRect.top + element.scrollTop) * scaleY));
    })
    .filter((value) => value > 0 && value < canvas.height)
    .sort((a, b) => a - b)
    .filter((value, index, list) => index === 0 || Math.abs(value - list[index - 1]) > 24);
}

function getNextSliceHeight({ y, maxSliceHeight, canvasHeight, breaks = [] }) {
  const remaining = canvasHeight - y;

  if (remaining <= maxSliceHeight) return remaining;

  const minSliceHeight = Math.floor(maxSliceHeight * 0.58);
  const idealEnd = y + maxSliceHeight;
  const minEnd = y + minSliceHeight;
  const candidates = breaks.filter(point => point > minEnd && point < idealEnd - 24);
  const selected = candidates.length ? candidates[candidates.length - 1] : idealEnd;

  return Math.max(1, Math.min(selected - y, remaining));
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

  clone.style.width = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.margin = '0 auto';
  clone.querySelectorAll('script, iframe, video').forEach(node => node.remove());
  sanitizeInlineStyleTree(clone, theme);
  stripExportClasses(clone);
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

  const width = Math.ceil(element.scrollWidth || element.getBoundingClientRect().width);
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
  const width = Math.ceil(element.scrollWidth || element.getBoundingClientRect().width);
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

    return await withTimeout(html2canvas(clone, {
      backgroundColor: EXPORT_BG,
      scale: 1,
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

function exportPdf(canvas, baseName, element) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const usableWidth = PDF_PAGE.width - (PDF_PAGE.margin * 2);
  const usableHeight = PDF_PAGE.height - (PDF_PAGE.margin * 2);
  const maxSliceHeight = Math.floor(canvas.width * (usableHeight / usableWidth));
  const breaks = getPreferredBreaks(element, canvas);
  let y = 0;
  let page = 0;

  while (y < canvas.height) {
    const sliceHeight = getNextSliceHeight({
      y,
      maxSliceHeight,
      canvasHeight: canvas.height,
      breaks,
    });
    const slice = sliceCanvas(canvas, y, sliceHeight);
    const imageHeight = Math.min(usableHeight, usableWidth * (slice.height / slice.width));

    if (page > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      canvasToJpegDataUrl(slice),
      'JPEG',
      PDF_PAGE.margin,
      PDF_PAGE.margin,
      usableWidth,
      imageHeight,
      undefined,
      'FAST'
    );

    y += sliceHeight;
    page += 1;
  }

  pdf.save(`${baseName}.pdf`);
}

async function exportPptx(canvas, baseName, element) {
  const usableWidth = PPTX_PAGE.width - (PPTX_PAGE.margin * 2);
  const usableHeight = PPTX_PAGE.height - (PPTX_PAGE.margin * 2);
  const maxSliceHeight = Math.floor(canvas.width * (usableHeight / usableWidth));
  const breaks = getPreferredBreaks(element, canvas);
  const slides = [];
  let y = 0;

  while (y < canvas.height) {
    const sliceHeight = getNextSliceHeight({
      y,
      maxSliceHeight,
      canvasHeight: canvas.height,
      breaks,
    });
    const slice = sliceCanvas(canvas, y, sliceHeight);
    const imageHeight = Math.min(usableHeight, usableWidth * (slice.height / slice.width));
    const offsetY = PPTX_PAGE.margin + Math.max(0, (usableHeight - imageHeight) / 2);

    slides.push({
      imageBase64: canvasToJpegDataUrl(slice).split(',')[1],
      x: PPTX_PAGE.margin,
      y: offsetY,
      w: usableWidth,
      h: imageHeight,
    });

    y += sliceHeight;
  }

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
  const mediaFolder = ppt.folder('media');

  slides.forEach((slide, index) => {
    const slideNumber = index + 1;
    slidesFolder.file(`slide${slideNumber}.xml`, buildSlideXml(slide, slideWidth, slideHeight));
    slideRelsFolder.file(`slide${slideNumber}.xml.rels`, buildSlideRels(slideNumber));
    mediaFolder.file(`portfolio-${slideNumber}.jpg`, slide.imageBase64, { base64: true });
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
  <Default Extension="jpg" ContentType="image/jpeg"/>
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

function buildSlideXml(slide, width, height) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="F8FAFC"/></a:solidFill></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/><a:chOff x="0" y="0"/><a:chExt cx="${width}" cy="${height}"/></a:xfrm></p:grpSpPr>
      <p:pic>
        <p:nvPicPr><p:cNvPr id="2" name="Portafolio"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="${inchesToEmu(slide.x)}" y="${inchesToEmu(slide.y)}"/><a:ext cx="${inchesToEmu(slide.w)}" cy="${inchesToEmu(slide.h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function buildSlideRels(slideNumber) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/portfolio-${slideNumber}.jpg"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
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
  const width = Math.ceil(element.scrollWidth || element.getBoundingClientRect().width);
  const clone = element.cloneNode(true);

  prepareInlinedClone(element, clone, assetMap, theme, width);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeXml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: ${EXPORT_BG};
      font-family: Arial, sans-serif;
      color: #111827;
    }
    main {
      width: 100%;
      overflow-x: auto;
    }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <main>
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

  let canvas;

  try {
    canvas = await capturePortfolioWithFallback(element);
  } catch (error) {
    throw new Error(error?.message || 'No se pudo capturar el portafolio.');
  }

  try {
    if (format === 'png') {
      await exportImage(canvas, format, baseName);
      return;
    }

    if (format === 'pdf') {
      exportPdf(canvas, baseName, element);
      return;
    }

    if (format === 'pptx') {
      await exportPptx(canvas, baseName, element);
      return;
    }
  } catch (error) {
    throw new Error(error?.message || 'No se pudo generar el archivo solicitado.');
  }

  throw new Error('Formato de descarga no soportado.');
}
