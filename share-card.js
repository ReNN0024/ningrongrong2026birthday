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
  const KICKER_FONT_FAMILY = "'DM Serif Display', Georgia, Times New Roman, serif";
  const LABEL_SUB_FONT_FAMILY = "Avenir Next, Helvetica Neue, PingFang SC, sans-serif";
  const SHARE_ASSET_VERSION = "20260728-01";
  const withAssetVersion = src => `${src}${src.includes("?") ? "&" : "?"}v=${SHARE_ASSET_VERSION}`;
  const FONT_ASSETS = {
    kickerItalic: "assets/fonts/DMSerifDisplay-Italic.ttf"
  };
  const RESULT_CARD_MAPPINGS = [
    {
      series: "R",
      seriesName: "Restrained",
      quadrant: "third",
      quadrantLabel: "荆棘 × 寻常",
      background: "green",
      lineart: "r-lineart-green.webp",
      lineartLabel: "R线稿裁切-绿色"
    },
    {
      series: "O",
      seriesName: "Orthodox",
      quadrant: "second",
      quadrantLabel: "荆棘 × 不忘",
      background: "blue",
      lineart: "o-lineart-blue.webp",
      lineartLabel: "O线稿裁切-蓝色"
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
      seriesName: "Gentle",
      quadrant: "fourth",
      quadrantLabel: "繁花 × 寻常",
      background: "pink",
      lineart: "g-lineart-pink.webp",
      lineartLabel: "G线稿裁切-粉色"
    }
  ];
  const QUADRANT_TESTS = {
    first: item => item.x >= 0 && item.y >= 0,
    second: item => item.x < 0 && item.y >= 0,
    third: item => item.x < 0 && item.y < 0,
    fourth: item => item.x >= 0 && item.y < 0
  };

  // Logo 坐标系二次赋值（ASSET_REASSIGNMENT.md）
  // 格式：{ logoId: { x: xOffset, y: yOffset } }
  // xOffset/yOffset 为分界点偏移，默认值为 0
  const LOGO_QUADRANT_OFFSETS = {
    "1_2": { x: -1, y: 0 },  // 暝夜：自带荆棘倾向，X 轴分界左移至 -1
    "1_3": { x: -1, y: 0 }   // 昏晓：自带荆棘倾向，X 轴分界左移至 -1
  };

  function getOffset(item) {
    return LOGO_QUADRANT_OFFSETS[item.id] || { x: 0, y: 0 };
  }

  function adjustedX(item) {
    const offset = getOffset(item);
    return item.x - offset.x;
  }

  function adjustedY(item) {
    const offset = getOffset(item);
    return item.y - offset.y;
  }
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
      coord: { x: 42, y: 450 },
      copy: { kicker: [72, 74, 390], title: [72, 210, 460], desc: [72, 300, 430], footer: [42, 982, 440] }
    },
    O: {
      align: "left",
      coord: { x: 57, y: 195 },
      copy: { kicker: [72, 74, 420], title: [72, 760, 560], desc: [74, 848, 586], footer: [72, 1008, 520] }
    },
    N: {
      align: "left",
      coord: { x: 72, y: 432 },
      copy: { kicker: [360, 74, 360], title: [338, 200, 410], desc: [338, 290, 402], footer: [72, 982, 440] }
    },
    G: {
      align: "left",
      coord: { x: 72, y: 104 },
      copy: { kicker: [72, 756, 410], title: [72, 810, 520], desc: [74, 896, 586], footer: [72, 1008, 520] }
    }
  };
  const LABEL_LAYOUTS = {
    R: { dropcap: [70, 42, 106], main: [154, 66, 42], sub: [158, 114, 18], slash: [151, 112, 27], hairline: [232, 126, 96] },
    O: { dropcap: [57, 42, 106], main: [139, 66, 42], sub: [143, 114, 18], slash: [135, 112, 27], hairline: [221, 126, 104] },
    N: { dropcap: [70, 42, 106], main: [154, 66, 42], sub: [158, 114, 18], slash: [151, 112, 27], hairline: [232, 126, 96] },
    G: { dropcap: [70, 682, 106], main: [154, 706, 42], sub: [158, 754, 18], slash: [151, 752, 27], hairline: [232, 766, 104] }
  };
  const LABEL_PALETTES = {
    blue: { drop: "#315F78", main: "#407C9A", sub: "#315F78", line: "#3D7FA4" },
    pink: { drop: "#9B5D6B", main: "#A86675", sub: "#9B5D6B", line: "#B95F72" },
    yellow: { drop: "#8E692B", main: "#9E722B", sub: "#8E692B", line: "#A87425" },
    green: { drop: "#3E7449", main: "#4E8758", sub: "#3E7449", line: "#4D8B59" }
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
        src: withAssetVersion(`assets/share-card-figures/${mapping.lineart}`),
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
    const adjustedItem = { x: adjustedX(item), y: adjustedY(item) };
    const mapping = RESULT_CARD_MAPPINGS.find(candidate => QUADRANT_TESTS[candidate.quadrant]?.(adjustedItem));
    return mapping?.series || "R";
  }

  function calculatePersonality(placed) {
    const stats = Object.fromEntries(Object.keys(QUADRANTS).map(key => [key, { key, count: 0, outer: 0 }]));
    let sumX = 0;
    let sumY = 0;

    placed.forEach(item => {
      const key = quadrantFor(item);
      const ax = adjustedX(item);
      const ay = adjustedY(item);
      stats[key].count += 1;
      stats[key].outer += Math.hypot(ax, ay);
      sumX += ax;
      sumY += ay;
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

  function wrapText(text, maxChars = 17) {
    const chars = [...String(text)];
    const lines = [];
    // 行首禁则：不能出现在行首的标点
    const lineStartForbidden = new Set(['，', '。', '！', '？', '；', '：', '、', '）', '】', '》', '」', '』', '"', "'", ')', ']']);
    // 行尾禁则：不能出现在行尾的标点
    const lineEndForbidden = new Set(['（', '【', '《', '「', '『', '"', "'", '(', '[']);

    // 第一步：按 \n 强制分行，\n 后的内容不限制字数
    const segments = String(text).split('\n');
    for (const segment of segments) {
      const segChars = [...segment];
      if (segChars.length === 0) continue;
      
      // 如果片段超过 maxChars，仍然需要分行
      if (segChars.length <= maxChars) {
        lines.push(segChars);
      } else {
        // 超长片段按 maxChars 分行
        let idx = 0;
        while (idx < segChars.length && lines.length < 3) {
          const end = Math.min(idx + maxChars, segChars.length);
          lines.push(segChars.slice(idx, end));
          idx = end;
        }
      }
    }

    // 第二步：处理行首禁则 - 从上一行末尾借字符
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (lineStartForbidden.has(line[0])) {
        const prevLine = lines[i - 1];
        const lastChar = prevLine[prevLine.length - 1];
        if (!lineEndForbidden.has(lastChar)) {
          prevLine.pop();
          line.unshift(lastChar);
        }
      }
    }

    // 第三步：处理行尾禁则 - 将禁则字符移到下一行开头
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      while (line.length > 0 && lineEndForbidden.has(line[line.length - 1])) {
        const lastChar = line.pop();
        lines[i + 1].unshift(lastChar);
      }
    }

    // 第四步：以第一行字数为基准，使用原始字符重新分配（仅在没有 \n 强制换行时执行）
    const hasForcedLineBreak = String(text).includes('\n');
    if (lines.length > 1 && !hasForcedLineBreak) {
      let baseLength = lines[0].length;
      // 如果最后一行太短（≤2 字），减少 baseLength 让最后一行多分一些
      const lastLine = lines[lines.length - 1];
      if (lastLine.length <= 2) {
        baseLength = baseLength - 1;
      }
      
      lines.length = 0;
      let idx = 0;
      while (idx < chars.length && lines.length < 3) {
        const end = Math.min(idx + baseLength, chars.length);
        lines.push(chars.slice(idx, end));
        idx = end;
      }
      // 处理避头尾
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (lineStartForbidden.has(line[0])) {
          const prevLine = lines[i - 1];
          const lastChar = prevLine[prevLine.length - 1];
          if (!lineEndForbidden.has(lastChar)) {
            prevLine.pop();
            line.unshift(lastChar);
          }
        }
      }
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        while (line.length > 0 && lineEndForbidden.has(line[line.length - 1])) {
          const lastChar = line.pop();
          lines[i + 1].unshift(lastChar);
        }
      }
    }

    return lines.map(line => line.join(''));
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

  function renderKickerText({ style, text }) {
    const [seriesName, tendency = ""] = String(text).split("-");
    const series = style.mapping?.series || seriesName.slice(0, 1);
    const layout = LABEL_LAYOUTS[series] || LABEL_LAYOUTS.R;
    const palette = LABEL_PALETTES[style.mapping?.background] || LABEL_PALETTES.blue;
    const initial = seriesName.slice(0, 1);
    const rest = seriesName.slice(1);
    const [dropX, dropY, dropSize] = layout.dropcap;
    const [mainX, mainY, mainSize] = layout.main;
    const [subX, subY, subSize] = layout.sub;
    const [slashX, slashY, slashHeight] = layout.slash;
    const [lineX, lineY, lineWidth] = layout.hairline;

    const parts = [];
    parts.push(`<text x="${scaled(dropX)}" y="${scaled(dropY)}" text-anchor="start" dominant-baseline="text-before-edge" font-family="${KICKER_FONT_FAMILY}" font-size="${scaled(dropSize)}" font-weight="400" font-style="italic" letter-spacing="-0.04em" fill="${palette.drop}" opacity="0.82">${escapeXML(initial)}</text>`);
    parts.push(`<text x="${scaled(mainX)}" y="${scaled(mainY)}" text-anchor="start" dominant-baseline="text-before-edge" font-family="${KICKER_FONT_FAMILY}" font-size="${scaled(mainSize)}" font-weight="400" font-style="italic" letter-spacing="-0.01em" fill="${palette.main}" opacity="0.9">${escapeXML(rest)}</text>`);
    parts.push(`<text x="${scaled(subX)}" y="${scaled(subY)}" text-anchor="start" dominant-baseline="text-before-edge" font-family="${LABEL_SUB_FONT_FAMILY}" font-size="${scaled(subSize)}" font-weight="700" letter-spacing="0.14em" fill="${palette.sub}" opacity="0.62">${escapeXML(tendency)}</text>`);
    parts.push(`<line x1="${scaled(slashX)}" y1="${scaled(slashY)}" x2="${scaled(slashX)}" y2="${scaled(slashY + slashHeight)}" stroke="${palette.line}" stroke-width="2" stroke-linecap="round" opacity="0.22" transform="rotate(18 ${scaled(slashX)} ${scaled(slashY + slashHeight / 2)})"/>`);
    parts.push(`<line x1="${scaled(lineX)}" y1="${scaled(lineY)}" x2="${scaled(lineX + lineWidth)}" y2="${scaled(lineY)}" stroke="${palette.line}" stroke-width="2" stroke-linecap="round" opacity="0.2"/>`);
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
    const axisLabelBase = `font-family="sans-serif" font-size="30" font-weight="800" fill="${style.axis}" fill-opacity="0.82"`;
    return `<g id="coordinate-card" transform="translate(${scaled(style.coord.x)} ${scaled(style.coord.y)}) scale(${TEMPLATE_SCALE})">
      <rect x="0" y="0" width="520" height="520" rx="36" fill="#FFFFFF" fill-opacity="${style.glass}" stroke="${style.accent}" stroke-opacity="0.34" stroke-width="2"/>
      <g transform="translate(26 26)">
        <rect x="0" y="0" width="468" height="468" rx="22" fill="#FFFFFF" fill-opacity="0.16" stroke="${style.accent}" stroke-opacity="0.28" stroke-width="1"/>
        <line x1="233" y1="26" x2="233" y2="442" stroke="${style.axis}" stroke-opacity="0.42" stroke-width="2"/>
        <line x1="26" y1="233" x2="442" y2="233" stroke="${style.axis}" stroke-opacity="0.42" stroke-width="2"/>
        <circle cx="234" cy="234" r="7" fill="${style.base}" stroke="${style.axis}" stroke-opacity="0.55" stroke-width="2"/>
        <text x="252" y="64" ${axisLabelBase}>不忘</text>
        <text x="42" y="226" ${axisLabelBase}>荆棘</text>
        <text x="360" y="274" ${axisLabelBase}>繁花</text>
        <text x="216" y="434" text-anchor="end" ${axisLabelBase}>寻常</text>
      </g>
    </g>
    <g id="placed-logo-result-layer">${logoLayer}</g>`;
  }

  async function buildSVG({ placed, logos, activityTitle, shareUrl }) {
    const personality = calculatePersonality(placed);
    const style = CARD_STYLES[personality.main] || CARD_STYLES.R;
    const result = personality.result;
    const descLines = wrapText(result.description, 17);
    const footer = `${activityTitle} / ${shareUrl}`;
    const logoLayer = await buildLogoLayer(placed, logos, style);
    const figureDataURL = await imageToDataURL(style.figure.src);
    const kickerFontDataURL = await assetToDataURL(FONT_ASSETS.kickerItalic);
    const anchor = textAnchorFor(style, "title");
    const displayTendency = DISPLAY_TENDENCY_KEYS[personality.tendency] || personality.tendency.toUpperCase();
    const kickerText = `${style.seriesName || personality.main}-${displayTendency}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
      <defs>
        <clipPath id="card-clip">
          <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="48" ry="48"/>
        </clipPath>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="27" stdDeviation="24" flood-color="${style.shadow}" flood-opacity="0.08"/></filter>
        ${kickerFontDataURL ? `<style>@font-face{font-family:'DM Serif Display';src:url('${kickerFontDataURL}') format('truetype');font-style:italic;font-weight:400;font-display:block;}</style>` : ""}
        ${renderGlow(style)}
      </defs>
      <g clip-path="url(#card-clip)">
        <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="48" ry="48" fill="${style.base}"/>
        ${style.glows.map((_, index) => `<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#card-glow-${index})"/>`).join("")}
        ${figureDataURL ? `<image x="${scaled(style.figure.x)}" y="${scaled(style.figure.y)}" width="${scaled(style.figure.width)}" height="${scaled(style.figure.height)}" href="${figureDataURL}" opacity="${style.figure.opacity}" preserveAspectRatio="xMinYMin meet"/>` : ""}
        <g filter="url(#soft-shadow)">${renderCoordCard(style, logoLayer)}</g>
        ${renderKickerText({ style, text: kickerText })}
        <text x="${textXFor(style, "title").toFixed(2)}" y="${scaled(style.copy.title[1] + 64)}" text-anchor="${anchor}" font-family="serif" font-size="85.33" font-weight="900" fill="${style.title}">${escapeXML(result.name)}</text>
        ${renderTextBlock({ x: textXFor(style, "desc"), y: scale(style.copy.desc[1] + 32), lines: descLines, anchor, size: 34.67, lineHeight: 50, fill: style.desc, weight: 500 })}
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
