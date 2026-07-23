(() => {
  "use strict";

  const CARD_WIDTH = 1080;
  const CARD_HEIGHT = 1440;
  const TEMPLATE_SCALE = 4 / 3;
  const QUADRANTS = {
    r: { label: "荆棘 × 不忘", order: 0 },
    o: { label: "繁花 × 不忘", order: 1 },
    n: { label: "荆棘 × 寻常", order: 2 },
    g: { label: "繁花 × 寻常", order: 3 }
  };
  const TENDENCY_LABELS = {
    thorn: "THORN",
    flower: "FLOWER",
    memory: "MEMORY",
    daily: "DAILY"
  };
  const CARD_STYLES = {
    r: {
      base: "#F8EAEC", accent: "#B95F72", axis: "#4A3A40", shadow: "#42242B", glass: 0.28, markOpacity: 0.9, ruleOpacity: 0.4,
      kicker: "#A86675", title: "#3F3036", desc: "#69565D", footer: "#9E7380", align: "left",
      figure: { src: "assets/share-card-figures/r-figure.png", x: -19, y: -135, size: 1215, opacity: 0.5 },
      coord: { x: 57, y: 245 }, rule: { x: 72, y: 786, width: 180 },
      copy: { kicker: [72, 74, 420], title: [72, 810, 560], desc: [74, 898, 586], footer: [72, 1008, 520] },
      glows: [
        { x: 132, y: 156, rx: 420, ry: 320, color: "#F5A9B8", opacity: 0.78 },
        { x: 632, y: 236, rx: 360, ry: 300, color: "#FFE5A7", opacity: 0.58 },
        { x: 460, y: 850, rx: 440, ry: 360, color: "#CFE8E7", opacity: 0.55 }
      ],
      marks: [{ type: "hex", x: 112, y: 164, s: 1 }, { type: "hex", x: 318, y: 140, s: 0.9 }, { type: "hex", x: 164, y: 314, s: 0.9 }]
    },
    o: {
      base: "#F9F0D4", accent: "#A87425", axis: "#5D4B32", shadow: "#4D381A", glass: 0.27, markOpacity: 0.8, ruleOpacity: 0.4,
      kicker: "#9E722B", title: "#4B3922", desc: "#6F5A35", footer: "#9C7B36", align: "right",
      figure: { src: "assets/share-card-figures/o-figure.png", x: 0, y: -36, size: 1105, opacity: 0.5 },
      coord: { x: 23, y: 432 }, rule: { x: 558, y: 124, width: 182 },
      copy: { kicker: [360, 74, 360], title: [338, 142, 410], desc: [338, 232, 402], footer: [300, 982, 440] },
      glows: [
        { x: 640, y: 132, rx: 470, ry: 340, color: "#F2C35B", opacity: 0.68 },
        { x: 138, y: 472, rx: 430, ry: 360, color: "#FFE8A8", opacity: 0.84 },
        { x: 578, y: 850, rx: 380, ry: 300, color: "#F6C8B2", opacity: 0.44 }
      ],
      marks: [{ type: "petal", x: 302, y: 128, s: 1.06, r: -24 }, { type: "petal", x: 338, y: 314, s: 0.9, r: -18 }]
    },
    n: {
      base: "#E7F2F8", accent: "#3D7FA4", axis: "#2F4D63", shadow: "#1F384D", glass: 0.28, markOpacity: 0.8, ruleOpacity: 0.38,
      kicker: "#407C9A", title: "#253847", desc: "#486170", footer: "#527C94", align: "left-footer-right",
      figure: { src: "assets/share-card-figures/n-figure.png", x: 0, y: -55, size: 1160, opacity: 0.5 },
      coord: { x: 42, y: 450 }, rule: { x: 72, y: 142, width: 180 },
      copy: { kicker: [72, 74, 390], title: [72, 166, 460], desc: [72, 256, 430], footer: [42, 982, 440] },
      glows: [
        { x: 194, y: 784, rx: 430, ry: 350, color: "#8CC7E8", opacity: 0.70 },
        { x: 652, y: 532, rx: 400, ry: 330, color: "#B8D1E4", opacity: 0.58 },
        { x: 188, y: 190, rx: 360, ry: 300, color: "#F7D8CE", opacity: 0.42 }
      ],
      marks: [{ type: "hex", x: 94, y: 158, s: 1 }],
      wave: true
    },
    g: {
      base: "#EAF5EA", accent: "#4D8B59", axis: "#34523A", shadow: "#1F3D24", glass: 0.27, markOpacity: 0.9, ruleOpacity: 0.38,
      kicker: "#4E8758", title: "#253C2B", desc: "#4C624F", footer: "#638C67", align: "left",
      figure: { src: "assets/share-card-figures/g-figure.png", x: -43, y: -108, size: 1247, opacity: 0.5 },
      coord: { x: 72, y: 194 }, rule: { x: 72, y: 798, width: 180 },
      copy: { kicker: [72, 756, 410], title: [72, 810, 520], desc: [74, 896, 586], footer: [72, 1008, 520] },
      glows: [
        { x: 624, y: 806, rx: 420, ry: 340, color: "#A7D8A8", opacity: 0.76 },
        { x: 158, y: 328, rx: 440, ry: 360, color: "#D9EAB9", opacity: 0.74 },
        { x: 646, y: 138, rx: 340, ry: 280, color: "#F6D2B6", opacity: 0.42 }
      ],
      marks: [{ type: "petal", x: 312, y: 312, s: 1.12, r: -18 }, { type: "petal", x: 174, y: 162, s: 0.96, r: -26 }]
    }
  };

  const imageCache = new Map();

  function escapeXML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[char]));
  }

  function scale(value) { return Number(value) * TEMPLATE_SCALE; }
  function scaled(value) { return scale(value).toFixed(2); }

  function quadrantFor(item) {
    if (item.x < 0 && item.y >= 0) return "r";
    if (item.x >= 0 && item.y >= 0) return "o";
    if (item.x < 0 && item.y < 0) return "n";
    return "g";
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

  async function imageToDataURL(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = fetch(src)
      .then(response => {
        if (!response.ok) throw new Error("image request failed");
        return response.blob();
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(() => "");
    imageCache.set(src, promise);
    return promise;
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

  function renderMarks(style) {
    const marks = style.marks.map(mark => {
      const transform = `translate(${scaled(mark.x)} ${scaled(mark.y)}) scale(${(mark.s || 1) * TEMPLATE_SCALE}) rotate(${mark.r || 0})`;
      if (mark.type === "petal") {
        return `<path d="M36 0C60 0 72 17 72 27C72 43 54 54 31 54C13 54 0 42 0 27C0 12 16 0 36 0Z" transform="${transform}" fill="${style.accent}" fill-opacity="0.34" stroke="${style.accent}" stroke-opacity="0.42" stroke-width="2"/>`;
      }
      return `<polygon points="20,0 37.6,11.5 37.6,34.5 20,46 2.4,34.5 2.4,11.5" transform="${transform}" fill="${style.accent}" fill-opacity="0.38" stroke="${style.accent}" stroke-opacity="0.48" stroke-width="2"/>`;
    }).join("");
    if (!style.wave) return marks;
    return `${marks}<path d="M0 42C54-10 122-6 174 44s112 54 162-6" transform="translate(${scaled(94)} ${scaled(318)}) scale(${TEMPLATE_SCALE})" fill="none" stroke="${style.accent}" stroke-width="7" stroke-linecap="round" opacity=".45"/>`;
  }

  async function buildLogoLayer(placed, logos, style) {
    const logoMap = new Map(logos.map(logo => [logo.id, logo]));
    const cardX = scale(style.coord.x);
    const cardY = scale(style.coord.y);
    const center = scale(26 + 234);
    const usable = scale(208);
    const logoSize = scale(58);
    const items = [...placed].sort((left, right) => left.z - right.z);
    const parts = [];

    for (const item of items) {
      const logo = logoMap.get(item.id);
      if (!logo) continue;
      const x = cardX + center + item.x * usable - logoSize / 2;
      const y = cardY + center - item.y * usable - logoSize / 2;
      const dataURL = await imageToDataURL(logo.src);
      if (dataURL) {
        parts.push(`<image x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${logoSize.toFixed(1)}" height="${logoSize.toFixed(1)}" href="${dataURL}" preserveAspectRatio="xMidYMid meet"/>`);
      } else {
        parts.push(`<circle cx="${(x + logoSize / 2).toFixed(1)}" cy="${(y + logoSize / 2).toFixed(1)}" r="20" fill="#D8CAB4"/><text x="${(x + logoSize / 2).toFixed(1)}" y="${(y + logoSize / 2 + 5).toFixed(1)}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#756C62">${escapeXML(logo.slot)}</text>`);
      }
    }

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
        <g opacity="${style.markOpacity}">${renderMarks(style)}</g>
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
    const style = CARD_STYLES[personality.main] || CARD_STYLES.r;
    const result = personality.result;
    const descLines = wrapText(result.description, 14);
    const footer = `${activityTitle} · ${shareUrl}`;
    const logoLayer = await buildLogoLayer(placed, logos, style);
    const figureDataURL = await imageToDataURL(style.figure.src);
    const anchor = textAnchorFor(style, "title");
    const kickerText = `${personality.main.toUpperCase()} / ${TENDENCY_LABELS[personality.tendency] || personality.tendency} · ${personality.key}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
      <defs>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="27" stdDeviation="24" flood-color="${style.shadow}" flood-opacity="0.08"/></filter>
        ${renderGlow(style)}
      </defs>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="48" fill="${style.base}"/>
      ${style.glows.map((_, index) => `<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#card-glow-${index})"/>`).join("")}
      ${figureDataURL ? `<image x="${scaled(style.figure.x)}" y="${scaled(style.figure.y)}" width="${scaled(style.figure.size)}" height="${scaled(style.figure.size)}" href="${figureDataURL}" opacity="${style.figure.opacity}" preserveAspectRatio="xMidYMid meet"/>` : ""}
      <g filter="url(#soft-shadow)">${renderCoordCard(style, logoLayer)}</g>
      <rect x="${scaled(style.rule.x)}" y="${scaled(style.rule.y)}" width="${scaled(style.rule.width)}" height="2.67" fill="${style.accent}" opacity="${style.ruleOpacity}"/>
      <text x="${textXFor(style, "kicker").toFixed(2)}" y="${scaled(style.copy.kicker[1] + 28)}" text-anchor="${textAnchorFor(style, "kicker")}" font-family="sans-serif" font-size="37.33" font-weight="600" fill="${style.kicker}">${escapeXML(kickerText)}</text>
      <text x="${textXFor(style, "title").toFixed(2)}" y="${scaled(style.copy.title[1] + 64)}" text-anchor="${anchor}" font-family="serif" font-size="85.33" font-weight="900" fill="${style.title}">${escapeXML(result.name)}</text>
      ${renderTextBlock({ x: textXFor(style, "desc"), y: scale(style.copy.desc[1] + 32), lines: descLines, anchor, size: 42.67, lineHeight: 61.33, fill: style.desc, weight: 500 })}
      <text x="${textXFor(style, "footer").toFixed(2)}" y="${scaled(style.copy.footer[1] + 28)}" text-anchor="${textAnchorFor(style, "footer")}" font-family="sans-serif" font-size="37.33" font-weight="700" fill="${style.footer}">${escapeXML(footer)}</text>
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
      const dataURL = canvas.toDataURL("image/png");
      const blob = await canvasToBlob(canvas);
      return { dataURL, blob, svg, personality: calculatePersonality(options.placed) };
    } finally {
      URL.revokeObjectURL(svgURL);
    }
  }

  window.ShareCard = { generateShareImage, calculatePersonality };
})();
