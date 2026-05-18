import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const MAX_CANVAS_HEIGHT = 26000;
const IMAGE_QUALITY = 0.92;
const PDF_PAGE = {
  width: 210,
  height: 297,
  margin: 8,
};
const PPTX_PAGE = {
  width: 8.27,
  height: 11.69,
  margin: 0.3,
};
const EMU_PER_INCH = 914400;

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

function injectExportStyles(clonedDocument) {
  const style = clonedDocument.createElement('style');
  style.textContent = `
    * {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
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
      box-shadow: 0 0 0 10px rgba(0,119,183,.2), 0 0 0 17px rgba(255,255,255,.13), 0 30px 72px rgba(0,0,0,.46) !important;
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
      background: #eef6fb !important;
      border-color: #bfdceb !important;
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
      color: #4b5563 !important;
    }
  `;

  clonedDocument.head.appendChild(style);
}

function hasUnsupportedColorFunction(value = '') {
  return /\bcolor-mix\s*\(|\bcolor\s*\(/i.test(String(value || ''));
}

function sanitizeUnsupportedColors(clonedDocument) {
  const target = clonedDocument.querySelector('.portfolio-export-target');
  const nodes = target ? [target, ...target.querySelectorAll('*')] : [];

  nodes.forEach((node) => {
    const style = clonedDocument.defaultView.getComputedStyle(node);

    if (hasUnsupportedColorFunction(style.color)) {
      node.style.color = '#111827';
    }

    if (hasUnsupportedColorFunction(style.backgroundColor) || hasUnsupportedColorFunction(style.backgroundImage)) {
      node.style.backgroundColor = 'transparent';
      node.style.backgroundImage = 'none';
    }

    if (hasUnsupportedColorFunction(style.borderColor)) {
      node.style.borderColor = '#d1d5db';
    }

    ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor'].forEach((property) => {
      if (hasUnsupportedColorFunction(style[property])) {
        node.style[property] = '#d1d5db';
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

async function waitForImages(element) {
  const images = [...element.querySelectorAll('img')];

  await Promise.allSettled(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (typeof image.decode === 'function') return image.decode();

    return new Promise((resolve) => {
      image.onload = resolve;
      image.onerror = resolve;
    });
  }));
}

async function waitForReady(element) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await waitForImages(element);
}

async function capturePortfolio(element) {
  if (!element) {
    throw new Error('No se encontro el portafolio para descargar.');
  }

  await waitForReady(element);

  const width = Math.ceil(element.scrollWidth || element.getBoundingClientRect().width);
  const height = Math.ceil(element.scrollHeight || element.getBoundingClientRect().height);
  const scale = Math.max(1, Math.min(2, MAX_CANVAS_HEIGHT / Math.max(height, 1)));

  return html2canvas(element, {
    backgroundColor: '#f8fafc',
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width,
    height,
    windowWidth: Math.max(document.documentElement.scrollWidth, width),
    windowHeight: Math.max(document.documentElement.scrollHeight, height),
    scrollX: 0,
    scrollY: -window.scrollY,
    onclone: (clonedDocument) => {
      clonedDocument.body.classList.add('portfolio-export-mode');
      injectExportStyles(clonedDocument);
      sanitizeUnsupportedColors(clonedDocument);
    },
  });
}

async function exportImage(canvas, format, baseName) {
  const isJpg = format === 'jpg';
  const type = isJpg ? 'image/jpeg' : 'image/png';
  const blob = await canvasToBlob(canvas, type, isJpg ? IMAGE_QUALITY : undefined);

  downloadBlob(blob, `${baseName}.${format}`);
}

function exportPdf(canvas, baseName) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const usableWidth = PDF_PAGE.width - (PDF_PAGE.margin * 2);
  const usableHeight = PDF_PAGE.height - (PDF_PAGE.margin * 2);
  const sliceHeight = Math.floor(canvas.width * (usableHeight / usableWidth));
  let y = 0;
  let page = 0;

  while (y < canvas.height) {
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

async function exportPptx(canvas, baseName) {
  const usableWidth = PPTX_PAGE.width - (PPTX_PAGE.margin * 2);
  const usableHeight = PPTX_PAGE.height - (PPTX_PAGE.margin * 2);
  const sliceHeight = Math.floor(canvas.width * (usableHeight / usableWidth));
  const slides = [];
  let y = 0;

  while (y < canvas.height) {
    const slice = sliceCanvas(canvas, y, sliceHeight);
    const imageHeight = Math.min(usableHeight, usableWidth * (slice.height / slice.width));

    slides.push({
      imageBase64: canvasToJpegDataUrl(slice).split(',')[1],
      x: PPTX_PAGE.margin,
      y: PPTX_PAGE.margin,
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
  <PresentationFormat>A4 Portrait</PresentationFormat>
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

export async function exportPortfolio(element, { format, title = 'portafolio' }) {
  const canvas = await capturePortfolio(element);
  const baseName = slugify(`${title}-${new Date().toISOString().slice(0, 10)}`);

  if (format === 'png' || format === 'jpg') {
    await exportImage(canvas, format, baseName);
    return;
  }

  if (format === 'pdf') {
    exportPdf(canvas, baseName);
    return;
  }

  if (format === 'pptx') {
    await exportPptx(canvas, baseName);
    return;
  }

  throw new Error('Formato de descarga no soportado.');
}
