(() => {
  "use strict";

  const CARD_WIDTH = 1080;
  const CARD_HEIGHT = 1440;
  const TEMPLATE_SCALE = 4 / 3;
  const LINEART_OPACITIES = {
    R: 0.64,
    O: 0.6,
    N: 0.52,
    G: 0.56
  };
  const KICKER_FONT_FAMILY = "'Instrument Serif', Georgia, Times New Roman, serif";
  const TENDENCY_FONT_FAMILY = "'DM Serif Display', Georgia, Times New Roman, serif";
  const FONT_ASSETS = {
    kickerItalic: "assets/fonts/InstrumentSerif-Italic.woff2",
    tendencyItalic: "assets/fonts/DMSerifDisplay-Italic.ttf"
  };
  const RESULT_CARD_MAPPINGS = [
    {
      series: "R",
      seriesName: "Restrained",
      quadrant: "third",
      quadrantLabel: "荆棘 × 寻常",
      background: "blue",
      lineart: "r-lineart-blue.webp",
      lineartLabel: "R线稿裁切-蓝色"
    },
    {
      series: "O",
      seriesName: "Obdurate",
      quadrant: "second",
      quadrantLabel: "荆棘 × 不忘",
      background: "pink",
      lineart: "o-lineart-pink.webp",
      lineartLabel: "O线稿裁切-粉色"
    },
    {
      series: "N",
      seriesName: "Numinous",
      quadrant: "first",
      quadrantLabel: "繁花 × 不忘",
      background: "yellow",
      lineart: "n-lineart-yellow.webp",
      lineartLabel: "N线稿裁切-黄色"
    },
    {
      series: "G",
      seriesName: "Gentled",
      quadrant: "fourth",
      quadrantLabel: "繁花 × 寻常",
      background: "green",
      lineart: "g-lineart-green.webp",
      lineartLabel: "G线稿裁切-绿色"
    }
  ];
  const QUADRANT_TESTS = {
    first: item => item.x >= 0 && item.y >= 0,
    second: item => item.x < 0 && item.y >= 0,
    third: item => item.x < 0 && item.y < 0,
    fourth: item => item.x >= 0 && item.y < 0
  };
  const QUADRANTS = Object.fromEntries(RESULT_CARD_MAPPINGS.map((mapping, index) => [
    mapping.series,
    { label: mapping.quadrantLabel, order: index }
  ]));
  const DISPLAY_TENDENCY_KEYS = {
    flower: "BLOOM",
    daily: "HEARTH"
  };
  const CARD_PALETTES = {
    blue: {
      base: "#E2F0F8", accent: "#327CA7", axis: "#263F56", shadow: "#17314A", glass: 0.3, ruleOpacity: 0.46,
      kicker: "#347A9F", title: "#1F3548", desc: "#405E70", footer: "#4A7893",
      glows: [
        { x: 174, y: 744, rx: 500, ry: 390, color: "#74BCE4", opacity: 0.78 },
        { x: 654, y: 468, rx: 440, ry: 350, color: "#A8CAE4", opacity: 0.62 },
        { x: 214, y: 180, rx: 360, ry: 280, color: "#F0CFC8", opacity: 0.34 }
      ]
    },
    pink: {
      base: "#FAE9EF", accent: "#B95F72", axis: "#4A3A40", shadow: "#42242B", glass: 0.28, ruleOpacity: 0.4,
      kicker: "#A86675", title: "#3F3036", desc: "#69565D", footer: "#9E7380",
      glows: [
        { x: 132, y: 156, rx: 420, ry: 320, color: "#F58CA8", opacity: 0.72 },
        { x: 632, y: 236, rx: 360, ry: 300, color: "#FFB8C4", opacity: 0.48 },
        { x: 460, y: 850, rx: 440, ry: 360, color: "#EDADC7", opacity: 0.38 }
      ]
    },
    yellow: {
      base: "#F8F0D8", accent: "#9A6A22", axis: "#574832", shadow: "#473516", glass: 0.28, ruleOpacity: 0.36,
      kicker: "#936C2A", title: "#463721", desc: "#685736", footer: "#917537",
      glows: [
        { x: 640, y: 150, rx: 430, ry: 320, color: "#E5B94F", opacity: 0.5 },
        { x: 150, y: 468, rx: 400, ry: 340, color: "#F8E2A1", opacity: 0.56 },
        { x: 586, y: 866, rx: 360, ry: 290, color: "#EFC0A7", opacity: 0.3 }
      ]
    },
    green: {
      base: "#E7F3E7", accent: "#438350", axis: "#2C4D33", shadow: "#18381F", glass: 0.3, ruleOpacity: 0.44,
      kicker: "#467F50", title: "#203929", desc: "#465F4B", footer: "#5A875F",
      glows: [
        { x: 604, y: 780, rx: 470, ry: 360, color: "#96D39D", opacity: 0.72 },
        { x: 168, y: 342, rx: 420, ry: 340, color: "#CFE7AE", opacity: 0.62 },
        { x: 666, y: 134, rx: 300, ry: 250, color: "#F0CDB5", opacity: 0.32 }
      ]
    }
  };
  const CARD_LAYOUTS = {
    R: {
      align: "left-footer-right",
      coord: { x: 42, y: 450 }, rule: { x: 72, y: 142, width: 460 },
      copy: { kicker: [72, 74, 390], title: [72, 166, 460], desc: [72, 256, 430], footer: [42, 982, 440] }
    },
    O: {
      align: "left",
      coord: { x: 57, y: 245 }, rule: { x: 72, y: 786, width: 560 },
      copy: { kicker: [72, 74, 420], title: [72, 810, 560], desc: [74, 898, 586], footer: [72, 1008, 520] }
    },
    N: {
      align: "right",
      coord: { x: 23, y: 432 }, rule: { x: 338, y: 124, width: 410 },
      copy: { kicker: [360, 74, 360], title: [338, 142, 410], desc: [338, 232, 402], footer: [300, 982, 440] }
    },
    G: {
      align: "left",
      coord: { x: 72, y: 194 }, rule: { x: 72, y: 798, width: 520 },
      copy: { kicker: [72, 756, 410], title: [72, 810, 520], desc: [74, 896, 586], footer: [72, 1008, 520] }
    }
  };
  const CARD_STYLES = Object.fromEntries(RESULT_CARD_MAPPINGS.map(mapping => {
    const palette = CARD_PALETTES[mapping.background] || CARD_PALETTES.blue;
    const layout = CARD_LAYOUTS[mapping.series] || CARD_LAYOUTS.R;
    return [mapping.series, {
      ...palette,
      ...layout,
      mapping,
      seriesName: mapping.seriesName,
      figure: {
        src: `assets/share-card-figures/${mapping.lineart}`,
        x: 0,
        y: 0,
        width: 810,
        height: 1080,
        opacity: LINEART_OPACITIES[mapping.series] ?? 0.6
      }
    }];
  }));

  const imageCache = new Map();
  const assetCache = new Map();

  function escapeXML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[char]));
  }

  function scale(value) { return Number(value) * TEMPLATE_SCALE; }
  function scaled(value) { return scale(value).toFixed(2); }

  function quadrantFor(item) {
    const mapping = RESULT_CARD_MAPPINGS.find(candidate => QUADRANT_TESTS[candidate.quadrant]?.(item));
    return mapping?.series || "R";
  }

  function calculatePersonality(placed) {
    const stats = Object.fromEntries(Object.keys(QUADRANTS).map(key => [key, { key, count: 0, outer: 0 }]));
    let sumX = 0;
    let sumY = 0;

    placed.forEach(item => {
      const key = quadrantFor(item);
      stats[key].count += 1;
      stats[key].outer += Math.hypot(item.x, item.y);
      sumX += item.x;
      sumY += item.y;
    });

    const main = Object.values(stats).sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      if (Math.abs(right.outer - left.outer) > .0001) return right.outer - left.outer;
      return QUADRANTS[left.key].order - QUADRANTS[right.key].order;
    })[0].key;

    const tendency = Math.abs(sumX) >= Math.abs(sumY)
      ? sumX < 0 ? "thorn" : "flower"
      : sumY >= 0 ? "memory" : "daily";

    const key = `${main}-${tendency}`;
    const fallback = { name: "故事坐标者", description: "你把每一份选择安放成坐标，也把心意留在故事里。" };
    return { key, main, tendency, stats, result: window.PERSONALITY_RESULTS?.[key] || fallback };
  }

  function wrapText(text, maxChars = 14) {
    const chars = [...String(text)];
    const lines = [];
    for (let index = 0; index < chars.length; index += maxChars) lines.push(chars.slice(index, index + maxChars).join(""));
    return lines.slice(0, 3);
  }

  async function assetToDataURL(src, cache = assetCache) {
    if (cache.has(src)) return cache.get(src);
    const promise = fetch(src)
      .then(response => {
        if (!response.ok) throw new Error("asset request failed");
        return response.blob();
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(() => "");
    cache.set(src, promise);
    return promise;
  }

  async function imageToDataURL(src) {
    return assetToDataURL(src, imageCache);
  }

  function textAnchorFor(style, layer) {
    if (style.align === "right" || (style.align === "left-footer-right" && layer === "footer")) return "end";
    return "start";
  }

  function textXFor(style, layer) {
    const [x, , width] = style.copy[layer];
    return textAnchorFor(style, layer) === "end" ? scale(x + width) : scale(x);
  }

  function renderTextBlock({ x, y, lines, anchor, size, lineHeight, fill, weight = 500 }) {
    return lines.map((line, index) => `<text x="${x.toFixed(2)}" y="${(y + index * lineHeight).toFixed(2)}" text-anchor="${anchor}" font-family="sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXML(line)}</text>`).join("");
  }

  function renderKickerText({ text, x, y, anchor, fill, width }) {
    const [seriesName, tendency = ""] = String(text).split("-");
    const initial = seriesName.slice(0, 1);
    const rest = seriesName.slice(1);
    const initialFontSize = 61.33;
    const seriesFontSize = 40;
    const tendencyFontSize = 34.67;
    const restLetterSpacing = 1.6;
    const tendencyLetterSpacing = 2.2;
    const initialGap = 11.33;
    const separatorGap = 18.67;
    const tendencyGap = 12;
    const separatorWidth = 17.33;
    const baseline = Number(y);
    const titleWidth = scale(width || 390);
    const titleStartX = anchor === "end" ? x - titleWidth : x;
    const initialWidth = initialFontSize * 0.54;
    const restWidth = rest.length * seriesFontSize * 0.48 + Math.max(0, rest.length - 1) * restLetterSpacing;
    const tendencyWidth = tendency.length * tendencyFontSize * 0.5 + Math.max(0, tendency.length - 1) * tendencyLetterSpacing;
    const labelWidth = initialWidth + initialGap + restWidth + separatorGap + separatorWidth + tendencyGap + tendencyWidth;
    const textStartX = anchor === "end" ? x - labelWidth : titleStartX;
    const restX = textStartX + initialWidth + initialGap;
    const separatorX = restX + restWidth + separatorGap;
    const tendencyX = separatorX + separatorWidth + tendencyGap;
    const underlineY = baseline + 25.33;
    const underlineInset = 4;

    const parts = [];
    parts.push(`<text x="${textStartX.toFixed(2)}" y="${baseline.toFixed(2)}" text-anchor="start" font-family="${KICKER_FONT_FAMILY}" font-size="${initialFontSize}" font-weight="400" font-style="italic" fill="${fill}">${escapeXML(initial)}</text>`);
    parts.push(`<text x="${restX.toFixed(2)}" y="${baseline.toFixed(2)}" text-anchor="start" font-family="${KICKER_FONT_FAMILY}" font-size="${seriesFontSize}" font-weight="400" font-style="italic" letter-spacing="${restLetterSpacing}" fill="${fill}" opacity="0.92">${escapeXML(rest)}</text>`);
    parts.push(`<text x="${separatorX.toFixed(2)}" y="${baseline.toFixed(2)}" text-anchor="start" font-family="${KICKER_FONT_FAMILY}" font-size="${seriesFontSize}" font-weight="400" font-style="italic" fill="${fill}" opacity="0.72">/</text>`);
    parts.push(`<text x="${tendencyX.toFixed(2)}" y="${baseline.toFixed(2)}" text-anchor="start" font-family="${TENDENCY_FONT_FAMILY}" font-size="${tendencyFontSize}" font-weight="400" font-style="italic" letter-spacing="${tendencyLetterSpacing}" fill="${fill}" opacity="0.86">${escapeXML(tendency)}</text>`);
    parts.push(`<line x1="${(textStartX + underlineInset).toFixed(2)}" y1="${underlineY.toFixed(2)}" x2="${(textStartX + labelWidth - underlineInset).toFixed(2)}" y2="${underlineY.toFixed(2)}" stroke="${fill}" stroke-width="1.6" stroke-linecap="round" opacity="0.38"/>`);
    return `<g id="result-kicker">${parts.join("")}</g>`;
  }

  async function buildLogoLayer(placed, logos, style) {
    const logoMap = new Map(logos.map(logo => [logo.id, logo]));
    const cardX = scale(style.coord.x);
    const cardY = scale(style.coord.y);
    const center = scale(26 + 234);
    const usable = scale(208);
    const logoSize = scale(58);
    const items = [...placed].sort((left, right) => left.z - right.z);
    const parts = await Promise.all(items.map(async item => {
      const logo = logoMap.get(item.id);
      if (!logo) return "";
      const x = cardX + center + item.x * usable - logoSize / 2;
      const y = cardY + center - item.y * usable - logoSize / 2;
      const dataURL = await imageToDataURL(logo.src);
      if (dataURL) {
        return `<image x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${logoSize.toFixed(1)}" height="${logoSize.toFixed(1)}" href="${dataURL}" preserveAspectRatio="xMidYMid meet"/>`;
      }
      return `<circle cx="${(x + logoSize / 2).toFixed(1)}" cy="${(y + logoSize / 2).toFixed(1)}" r="20" fill="#D8CAB4"/><text x="${(x + logoSize / 2).toFixed(1)}" y="${(y + logoSize / 2 + 5).toFixed(1)}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#756C62">${escapeXML(logo.slot)}</text>`;
    }));
    return parts.join("");
  }

  function renderGlow(style) {
    return style.glows.map((glow, index) => `<radialGradient id="card-glow-${index}" cx="${scaled(glow.x)}" cy="${scaled(glow.y)}" r="${scaled(Math.max(glow.rx, glow.ry))}" gradientUnits="userSpaceOnUse" gradientTransform="translate(${scaled(glow.x)} ${scaled(glow.y)}) scale(${(glow.rx / Math.max(glow.rx, glow.ry)).toFixed(3)} ${(glow.ry / Math.max(glow.rx, glow.ry)).toFixed(3)}) translate(${-scaled(glow.x)} ${-scaled(glow.y)})"><stop offset="0" stop-color="${glow.color}" stop-opacity="${glow.opacity}"/><stop offset="1" stop-color="${glow.color}" stop-opacity="0"/></radialGradient>`).join("");
  }

  function renderCoordCard(style, logoLayer) {
    return `<g id="coordinate-card" transform="translate(${scaled(style.coord.x)} ${scaled(style.coord.y)}) scale(${TEMPLATE_SCALE})">
      <rect x="0" y="0" width="520" height="520" rx="36" fill="#FFFFFF" fill-opacity="${style.glass}" stroke="${style.accent}" stroke-opacity="0.34" stroke-width="2"/>
      <g transform="translate(26 26)">
        <rect x="0" y="0" width="468" height="468" rx="22" fill="#FFFFFF" fill-opacity="0.16" stroke="${style.accent}" stroke-opacity="0.28" stroke-width="1"/>
        <line x1="233" y1="26" x2="233" y2="442" stroke="${style.axis}" stroke-opacity="0.42" stroke-width="2"/>
        <line x1="26" y1="233" x2="442" y2="233" stroke="${style.axis}" stroke-opacity="0.42" stroke-width="2"/>
        <circle cx="234" cy="234" r="7" fill="${style.base}" stroke="${style.axis}" stroke-opacity="0.55" stroke-width="2"/>
        <text x="252" y="64" font-family="sans-serif" font-size="30" font-weight="800" fill="${style.axis}" fill-opacity="0.82">不忘</text>
        <text x="42" y="226" font-family="sans-serif" font-size="30" font-weight="800" fill="${style.axis}" fill-opacity="0.82">荆棘</text>
        <text x="360" y="226" font-family="sans-serif" font-size="30" font-weight="800" fill="${style.axis}" fill-opacity="0.82">繁花</text>
        <text x="252" y="434" font-family="sans-serif" font-size="30" font-weight="800" fill="${style.axis}" fill-opacity="0.82">寻常</text>
      </g>
    </g>
    <g id="placed-logo-result-layer">${logoLayer}</g>`;
  }

  async function buildSVG({ placed, logos, activityTitle, shareUrl }) {
    const personality = calculatePersonality(placed);
    const style = CARD_STYLES[personality.main] || CARD_STYLES.R;
    const result = personality.result;
    const descLines = wrapText(result.description, 14);
    const footer = `${activityTitle} / ${shareUrl}`;
    const logoLayer = await buildLogoLayer(placed, logos, style);
    const figureDataURL = await imageToDataURL(style.figure.src);
    const kickerFontDataURL = await assetToDataURL(FONT_ASSETS.kickerItalic);
    const tendencyFontDataURL = await assetToDataURL(FONT_ASSETS.tendencyItalic);
    const anchor = textAnchorFor(style, "title");
    const displayTendency = DISPLAY_TENDENCY_KEYS[personality.tendency] || personality.tendency.toUpperCase();
    const kickerText = `${style.seriesName || personality.main}-${displayTendency}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
      <defs>
        <clipPath id="card-clip">
          <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="48" ry="48"/>
        </clipPath>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="27" stdDeviation="24" flood-color="${style.shadow}" flood-opacity="0.08"/></filter>
        ${kickerFontDataURL || tendencyFontDataURL ? `<style>${kickerFontDataURL ? `@font-face{font-family:'Instrument Serif';src:url('${kickerFontDataURL}') format('woff2');font-style:italic;font-weight:400;font-display:block;}` : ""}${tendencyFontDataURL ? `@font-face{font-family:'DM Serif Display';src:url('${tendencyFontDataURL}') format('truetype');font-style:italic;font-weight:400;font-display:block;}` : ""}</style>` : ""}
        ${renderGlow(style)}
      </defs>
      <g clip-path="url(#card-clip)">
        <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="48" ry="48" fill="${style.base}"/>
        ${style.glows.map((_, index) => `<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#card-glow-${index})"/>`).join("")}
        ${figureDataURL ? `<image x="${scaled(style.figure.x)}" y="${scaled(style.figure.y)}" width="${scaled(style.figure.width)}" height="${scaled(style.figure.height)}" href="${figureDataURL}" opacity="${style.figure.opacity}" preserveAspectRatio="xMinYMin meet"/>` : ""}
        <g filter="url(#soft-shadow)">${renderCoordCard(style, logoLayer)}</g>
        ${renderKickerText({ text: kickerText, x: textXFor(style, "kicker"), y: scale(style.copy.kicker[1] + 36), anchor: textAnchorFor(style, "kicker"), fill: style.kicker, width: style.copy.title[2] })}
        <text x="${textXFor(style, "title").toFixed(2)}" y="${scaled(style.copy.title[1] + 64)}" text-anchor="${anchor}" font-family="serif" font-size="85.33" font-weight="900" fill="${style.title}">${escapeXML(result.name)}</text>
        ${renderTextBlock({ x: textXFor(style, "desc"), y: scale(style.copy.desc[1] + 32), lines: descLines, anchor, size: 42.67, lineHeight: 61.33, fill: style.desc, weight: 500 })}
        <text x="${textXFor(style, "footer").toFixed(2)}" y="${scaled(style.copy.footer[1] + 28)}" text-anchor="${textAnchorFor(style, "footer")}" font-family="sans-serif" font-size="37.33" font-weight="700" fill="${style.footer}">${escapeXML(footer)}</text>
      </g>
    </svg>`;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function dataURLToBlob(dataURL) {
    const [header, payload] = dataURL.split(",");
    const mime = /data:([^;]+)/.exec(header)?.[1] || "image/png";
    const binary = atob(payload || "");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mime });
  }

  function canvasToBlob(canvas) {
    return new Promise(resolve => {
      if (canvas.toBlob) {
        canvas.toBlob(blob => resolve(blob || dataURLToBlob(canvas.toDataURL("image/png"))), "image/png");
        return;
      }
      resolve(dataURLToBlob(canvas.toDataURL("image/png")));
    });
  }

  async function generateShareImage(options) {
    const svg = await buildSVG(options);
    const svgURL = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = await loadImage(svgURL);
      const canvas = document.createElement("canvas");
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const blob = await canvasToBlob(canvas);
      const objectURL = URL.createObjectURL(blob);
      return { objectURL, blob, svg, personality: calculatePersonality(options.placed) };
    } finally {
      URL.revokeObjectURL(svgURL);
    }
  }

  function warmupShareAssets() {
    Object.values(CARD_STYLES).forEach(style => imageToDataURL(style.figure.src));
  }

  window.ShareCard = { generateShareImage, calculatePersonality, warmupShareAssets };
})();
