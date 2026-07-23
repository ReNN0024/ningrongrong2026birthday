(() => {
  "use strict";

  const CARD_WIDTH = 1080;
  const CARD_HEIGHT = 1440;
  const QUADRANTS = {
    r: { label: "荆棘 × 不忘", order: 0 },
    o: { label: "繁花 × 不忘", order: 1 },
    n: { label: "荆棘 × 寻常", order: 2 },
    g: { label: "繁花 × 寻常", order: 3 }
  };

  const imageCache = new Map();

  function escapeXML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[char]));
  }

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
    const centerY = 660;
    const usable = 358;
    const logoSize = 76;
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
    const linkY = 1246 + descriptionLines.length * 36 + 18;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
      <defs>
        <linearGradient id="card-base-gradient" x1="80" y1="0" x2="1000" y2="1440" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#FFF9EF"/>
          <stop offset="0.42" stop-color="#F7F0E6"/>
          <stop offset="1" stop-color="#F3E7D8"/>
        </linearGradient>
        <filter id="diffuse-blur" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="76"/>
        </filter>
        <linearGradient id="coordinate-base-gradient" x1="140" y1="260" x2="940" y2="1060" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#F8F1E9"/>
          <stop offset="0.48" stop-color="#F4EDE3"/>
          <stop offset="1" stop-color="#EFE8DB"/>
        </linearGradient>
        <radialGradient id="coordinate-ul-glow" cx="332" cy="452" r="640" gradientUnits="userSpaceOnUse" gradientTransform="translate(332 452) scale(1.1 0.96) translate(-332 -452)">
          <stop offset="0" stop-color="#E19DAC" stop-opacity="0.62"/>
          <stop offset="0.36" stop-color="#EABEC5" stop-opacity="0.44"/>
          <stop offset="0.78" stop-color="#F8F4ED" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="coordinate-ur-glow" cx="756" cy="452" r="640" gradientUnits="userSpaceOnUse" gradientTransform="translate(756 452) scale(1.1 0.96) translate(-756 -452)">
          <stop offset="0" stop-color="#EACB71" stop-opacity="0.64"/>
          <stop offset="0.38" stop-color="#F1DEA4" stop-opacity="0.45"/>
          <stop offset="0.78" stop-color="#F8F4ED" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="coordinate-ll-glow" cx="332" cy="852" r="650" gradientUnits="userSpaceOnUse" gradientTransform="translate(332 852) scale(1.08 0.98) translate(-332 -852)">
          <stop offset="0" stop-color="#9AC7CD" stop-opacity="0.58"/>
          <stop offset="0.38" stop-color="#C1DCDA" stop-opacity="0.42"/>
          <stop offset="0.8" stop-color="#F8F4ED" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="coordinate-lr-glow" cx="756" cy="852" r="650" gradientUnits="userSpaceOnUse" gradientTransform="translate(756 852) scale(1.08 0.98) translate(-756 -852)">
          <stop offset="0" stop-color="#B3CA95" stop-opacity="0.64"/>
          <stop offset="0.38" stop-color="#D3DEBA" stop-opacity="0.46"/>
          <stop offset="0.8" stop-color="#F8F4ED" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="coordinate-gradient-clip">
          <rect x="140" y="260" width="800" height="800" rx="28"/>
        </clipPath>
      </defs>
      <g id="share-card-background">
        <rect width="1080" height="1440" fill="url(#card-base-gradient)"/>
        <g id="ambient-diffuse-light" filter="url(#diffuse-blur)">
          <path d="M-120 36C64 -76 304 -36 414 118C524 272 392 424 164 392C-64 360 -224 172 -120 36Z" fill="#F1AEBB" opacity="0.32"/>
          <path d="M682 -38C902 -116 1138 38 1186 246C1234 454 968 542 760 410C552 278 462 40 682 -38Z" fill="#F0C765" opacity="0.32"/>
          <path d="M-156 900C70 770 326 862 406 1072C486 1282 252 1500 24 1416C-204 1332 -382 1030 -156 900Z" fill="#9FCBD6" opacity="0.30"/>
          <path d="M690 842C932 714 1216 902 1198 1172C1180 1442 858 1538 690 1324C522 1110 448 970 690 842Z" fill="#B9CF91" opacity="0.34"/>
          <path d="M226 282C422 122 706 184 846 402C986 620 814 858 520 808C226 758 30 442 226 282Z" fill="#F6D5A0" opacity="0.22"/>
          <path d="M126 610C290 500 486 540 594 676C702 812 578 1014 350 980C122 946 -38 720 126 610Z" fill="#D8B7E3" opacity="0.18"/>
          <path d="M494 112C646 18 850 72 900 236C950 400 754 500 582 424C410 348 342 206 494 112Z" fill="#F6BFA7" opacity="0.16"/>
          <path d="M476 1030C664 914 888 1014 920 1200C952 1386 716 1474 520 1368C324 1262 288 1146 476 1030Z" fill="#C9DFAE" opacity="0.18"/>
        </g>
      </g>
      <g id="header-activity-name">
        <text x="540" y="116" text-anchor="middle" font-family="serif" font-size="56" font-weight="500" fill="#453F3A">${escapedTitle}</text>
        <text x="540" y="174" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="400" fill="#8E7137" letter-spacing="3">${escapedSubtitle}</text>
        <line x1="350" y1="214" x2="730" y2="214" stroke="#BD9B55" stroke-width="2" opacity="0.72"/>
      </g>
      <g id="coordinate-frame-shell">
        <rect x="140" y="260" width="800" height="800" rx="28" fill="#F4EDE3" stroke="#B88A3A" stroke-width="3"/>
        <g id="coordinate-soft-gradient" clip-path="url(#coordinate-gradient-clip)">
          <rect x="140" y="260" width="800" height="800" fill="url(#coordinate-base-gradient)"/>
          <rect x="140" y="260" width="800" height="800" fill="url(#coordinate-ul-glow)"/>
          <rect x="140" y="260" width="800" height="800" fill="url(#coordinate-ur-glow)"/>
          <rect x="140" y="260" width="800" height="800" fill="url(#coordinate-ll-glow)"/>
          <rect x="140" y="260" width="800" height="800" fill="url(#coordinate-lr-glow)"/>
          <rect x="140" y="260" width="800" height="800" fill="none" stroke="#6B593A" stroke-width="90" opacity="0.04"/>
        </g>
        <rect x="148" y="268" width="784" height="784" rx="21" fill="none" stroke="#E4CC8B" stroke-width="2"/>
      </g>
      <g id="coordinate-axis-and-labels">
        <line x1="180" y1="660" x2="900" y2="660" stroke="#5F5E5A" stroke-width="2" opacity="0.62"/>
        <line x1="540" y1="300" x2="540" y2="1020" stroke="#5F5E5A" stroke-width="2" opacity="0.62"/>
        <circle cx="540" cy="660" r="8" fill="#FFFBF4" stroke="#5F5E5A" stroke-width="2"/>
        <text x="180" y="640" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">荆棘</text>
        <text x="820" y="640" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">繁花</text>
        <text x="562" y="340" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">不忘</text>
        <text x="562" y="1004" font-family="sans-serif" font-size="28" font-weight="500" fill="#453F3A">寻常</text>
      </g>
      <g id="placed-logo-result-layer">${logoLayer}</g>
      <g id="personality-result-panel">
        <text x="540" y="1168" text-anchor="middle" font-family="serif" font-size="52" font-weight="500" fill="#453F3A">${escapedName}</text>
        ${descriptionLines.map((line, index) => `<text x="540" y="${1226 + index * 36}" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="400" fill="#5F5E5A">${escapeXML(line)}</text>`).join("")}
        <text x="540" y="${linkY}" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="500" fill="#8E7137">${escapedShareUrl}</text>
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
      const dataURL = canvas.toDataURL("image/png");
      const blob = await canvasToBlob(canvas);
      return { dataURL, blob, svg, personality: calculatePersonality(options.placed) };
    } finally {
      URL.revokeObjectURL(svgURL);
    }
  }

  window.ShareCard = { generateShareImage, calculatePersonality };
})();
