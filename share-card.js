(() => {
  "use strict";

  const CARD_WIDTH = 1080;
  const CARD_HEIGHT = 1440;
  const QUADRANTS = {
    a: { label: "荆棘 × 不忘", order: 0 },
    b: { label: "繁花 × 不忘", order: 1 },
    c: { label: "荆棘 × 寻常", order: 2 },
    d: { label: "繁花 × 寻常", order: 3 }
  };

  const imageCache = new Map();

  function escapeXML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[char]));
  }

  function quadrantFor(item) {
    if (item.x < 0 && item.y >= 0) return "a";
    if (item.x >= 0 && item.y >= 0) return "b";
    if (item.x < 0 && item.y < 0) return "c";
    return "d";
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

  function wrapText(text, maxChars = 18) {
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

  async function buildLogoLayer(placed, logos) {
    const logoMap = new Map(logos.map(logo => [logo.id, logo]));
    const centerX = 540;
    const centerY = 680;
    const usable = 318;
    const logoSize = 54;
    const items = [...placed].sort((left, right) => left.z - right.z);
    const parts = [];

    for (const item of items) {
      const logo = logoMap.get(item.id);
      if (!logo) continue;
      const x = centerX + item.x * usable - logoSize / 2;
      const y = centerY - item.y * usable - logoSize / 2;
      const dataURL = await imageToDataURL(logo.src);
      if (dataURL) {
        parts.push(`<image x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${logoSize}" height="${logoSize}" href="${dataURL}" preserveAspectRatio="xMidYMid meet"/>`);
      } else {
        parts.push(`<circle cx="${(x + logoSize / 2).toFixed(1)}" cy="${(y + logoSize / 2).toFixed(1)}" r="20" fill="#D8CAB4"/><text x="${(x + logoSize / 2).toFixed(1)}" y="${(y + logoSize / 2 + 5).toFixed(1)}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#756C62">${escapeXML(logo.slot)}</text>`);
      }
    }

    return parts.join("");
  }

  async function buildSVG({ placed, logos, activityTitle, subtitle, shareUrl }) {
    const personality = calculatePersonality(placed);
    const result = personality.result;
    const descriptionLines = wrapText(result.description, 18);
    const logoLayer = await buildLogoLayer(placed, logos);
    const escapedTitle = escapeXML(activityTitle);
    const escapedSubtitle = escapeXML(subtitle);
    const escapedName = escapeXML(result.name);
    const escapedShareUrl = escapeXML(shareUrl);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
      <g id="share-card-background">
        <rect width="1080" height="1440" fill="#F7F1E7"/>
        <circle cx="120" cy="150" r="92" fill="#FBEAF0" opacity="0.78"/>
        <circle cx="185" cy="118" r="42" fill="#F5C4B3" opacity="0.5"/>
        <circle cx="945" cy="250" r="86" fill="#FAEEDA" opacity="0.82"/>
        <circle cx="890" cy="188" r="38" fill="#FAC775" opacity="0.45"/>
        <circle cx="130" cy="1230" r="82" fill="#E6F1FB" opacity="0.74"/>
        <circle cx="938" cy="1218" r="96" fill="#EAF3DE" opacity="0.76"/>
        <path d="M76 236C150 276 230 278 306 236" fill="none" stroke="#BD9B55" stroke-width="2" opacity="0.55"/>
        <path d="M774 1198C838 1158 922 1160 1000 1208" fill="none" stroke="#BD9B55" stroke-width="2" opacity="0.55"/>
      </g>
      <g id="share-card-frame">
        <rect x="54" y="50" width="972" height="1340" rx="58" fill="#FFFBF4" stroke="#B88A3A" stroke-width="3"/>
        <rect x="84" y="80" width="912" height="1280" rx="42" fill="none" stroke="#E4CC8B" stroke-width="2"/>
      </g>
      <g id="header-activity-name">
        <text x="540" y="156" text-anchor="middle" font-family="serif" font-size="54" font-weight="500" fill="#453F3A">${escapedTitle}</text>
        <text x="540" y="214" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="400" fill="#8E7137" letter-spacing="5">${escapedSubtitle}</text>
        <line x1="350" y1="252" x2="730" y2="252" stroke="#BD9B55" stroke-width="2" opacity="0.72"/>
      </g>
      <g id="coordinate-card-frame">
        <rect x="140" y="300" width="800" height="800" rx="56" fill="#F8F4ED" stroke="#B88A3A" stroke-width="3"/>
        <rect x="172" y="332" width="736" height="736" rx="38" fill="none" stroke="#E4CC8B" stroke-width="2"/>
      </g>
      <g id="coordinate-soft-quadrants">
        <rect x="190" y="350" width="350" height="350" rx="26" fill="#FBEAF0" opacity="0.82"/>
        <rect x="540" y="350" width="350" height="350" rx="26" fill="#FAEEDA" opacity="0.84"/>
        <rect x="190" y="700" width="350" height="350" rx="26" fill="#E6F1FB" opacity="0.82"/>
        <rect x="540" y="700" width="350" height="350" rx="26" fill="#EAF3DE" opacity="0.84"/>
      </g>
      <g id="coordinate-axis-and-labels">
        <line x1="220" y1="700" x2="860" y2="700" stroke="#5F5E5A" stroke-width="2" opacity="0.62"/>
        <line x1="540" y1="380" x2="540" y2="1020" stroke="#5F5E5A" stroke-width="2" opacity="0.62"/>
        <circle cx="540" cy="700" r="8" fill="#FFFBF4" stroke="#5F5E5A" stroke-width="2"/>
        <text x="230" y="684" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">荆棘</text>
        <text x="772" y="684" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">繁花</text>
        <text x="562" y="420" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">不忘</text>
        <text x="562" y="1004" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">寻常</text>
      </g>
      <g id="placed-logo-result-layer">${logoLayer}</g>
      <g id="personality-result-panel">
        <rect x="140" y="1134" width="800" height="178" rx="44" fill="#FFF8E7" stroke="#E4CC8B" stroke-width="2"/>
        <text x="540" y="1198" text-anchor="middle" font-family="serif" font-size="48" font-weight="500" fill="#453F3A">${escapedName}</text>
        ${descriptionLines.map((line, index) => `<text x="540" y="${1246 + index * 36}" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="400" fill="#5F5E5A">${escapeXML(line)}</text>`).join("")}
      </g>
      <g id="footer-share-info">
        <text x="540" y="1350" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="400" fill="#857D73">长按保存图片 · 分享你的坐标结果</text>
        <text x="540" y="1388" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="400" fill="#8E7137">${escapedShareUrl}</text>
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
      return { dataURL: canvas.toDataURL("image/png"), svg, personality: calculatePersonality(options.placed) };
    } finally {
      URL.revokeObjectURL(svgURL);
    }
  }

  window.ShareCard = { generateShareImage, calculatePersonality };
})();
