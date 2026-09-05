(() => {
  "use strict";

  const STORAGE_KEY = "ningrongrong-2026-coordinate-v1";
  const STORAGE_TTL = 30 * 24 * 60 * 60 * 1000;
  const ACTIVITY_ID = "ningrongrong-2026-birthday";
  const MIN_SHARE_PLACED = 7;
  const ASSET_ROOT = window.__ASSET_ROOT__ || "assets";
  const DETAIL_ASSET_VERSION = "20260728-01";
  const withAssetVersion = src => `${src}${src.includes("?") ? "&" : "?"}v=${DETAIL_ASSET_VERSION}`;
  const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;
  const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const placeholderColors = ["#caa7a2", "#cdbb83", "#9bb9bd", "#aabe91", "#c494aa", "#b7a58e", "#d5aa7c"];
  const officialNames = ["致绽放的你", "韶光慢", "赴明日如赴前尘", "涌流幻梦之蝶", "锋芒", "知晓我在的人", "珠如雨", "已收款三块五", "冲调午后", "左满舵", "槐花冰奶七分糖", "何人消隐于风声", "冠", "花", "暝夜", "心动瞬间", "莲花去国一千年", "公主巡察时", "引梦渡海", "海落潮升", "风起青萍之末", "入世", "现实童话", "阿女不答", "伴生", "直到世界听到", "", "", "时光的河入海流", "共婵娟", "再加九克好奇心", "没有偷吃啦", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
  const formatFragmentName = name => name.length > 7 ? escapeHTML(name.slice(0, 4)) + '<br>' + escapeHTML(name.slice(4)) : escapeHTML(name);
  const slotForIndex = index => `${Math.floor(index / 4) + 1}_${index % 4 + 1}`;
  const logos = Array.from({ length: 44 }, (_, index) => {
    const slot = slotForIndex(index);
    return {
      id: slot,
      slot,
      index,
      name: officialNames[index] || slot,
      src: `${ASSET_ROOT}/logos/${slot}.webp`,
      detail: `${ASSET_ROOT}/detail-images/${slot}.webp`,
      color: placeholderColors[index % placeholderColors.length],
      placeholder: index >= officialNames.length || !officialNames[index]
    };
  });
  const logoMap = new Map(logos.map(item => [item.id, item]));
  const UNLOCK_SCHEDULE = [
    { until: Date.UTC(2026, 8, 19, 16, 0, 0), maxIndex: 14 },
    { until: Date.UTC(2026, 8, 26, 16, 0, 0), maxIndex: 22 },
    { until: Date.UTC(2026, 8, 28, 13, 0, 0), maxIndex: 32 },
    { until: Infinity, maxIndex: 43 },
  ];
  function getUnlockedMaxIndex() {
    const override = new URLSearchParams(location.search).get('unlock');
    if (override === 'all' || override === 'full') return 43;
    const overrideNum = parseInt(override, 10);
    if (!isNaN(overrideNum)) return Math.min(Math.max(overrideNum, 0), 43);
    const now = Date.now();
    for (const tier of UNLOCK_SCHEDULE) {
      if (now < tier.until) return tier.maxIndex;
    }
    return 43;
  }
  const visibleLogos = logos.filter(l => l.index <= getUnlockedMaxIndex());
  const legacyIds = { yuanhang: "1_1", mingye: "1_2", shuye: "1_2", xintiao: "1_3", chunxiang: "1_4", daiyan: "2_1", xinyi: "2_2" };
  function migrateLogoId(id) {
    if (legacyIds[id]) return legacyIds[id];
    const match = /^placeholder-(\d{2})$/.exec(id || "");
    return match ? slotForIndex(Number(match[1]) + 5) : id;
  }

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const dom = {
    frame: $("#coordinateFrame"), world: $("#coordinateWorld"), placedLayer: $("#placedLayer"),
    mobileInstruction: $("#mobileInstruction"), mobileGuideCompact: $("#mobileGuideCompact"), mobileGuideCollapseBtn: $("#mobileGuideCollapseBtn"),
    grid: $("#logoGrid"), scroll: $("#logoScroll"), library: $("#libraryPanel"), libraryHead: $("#libraryHead"),
    ghost: $("#dragGhost"),
    toolbar: $("#coordinateToolbar"), toolbarHandle: $("#toolbarHandle"), zoomValue: $("#zoomValue"),
    minimap: $("#viewportMinimap"), minimapViewport: $("#minimapViewport"),
    desktopProgressFill: $("#desktopProgressFill"),
    guideLineX: $("#guideLineX"), guideLineX2: $("#guideLineX2"), guideLineY: $("#guideLineY"), guideLineY2: $("#guideLineY2"), previewBackdrop: $("#previewBackdrop"), preview: $("#previewPopover"), previewMedia: $("#previewMedia"),
    toastStack: $("#toastStack"), live: $("#liveRegion"), empty: $("#emptyState"),
    userIdDialog: $("#userIdDialog"), userIdInput: $("#userIdInput"), anonymousBtn: $("#anonymousBtn"), confirmUserIdBtn: $("#confirmUserIdBtn"), closeUserIdBtn: $("#userIdCloseBtn"),
    shareDialog: $("#shareDialog"), sharePreview: $("#sharePreview"), shareSaveGuide: $("#shareSaveGuide"), shareSaveGuideClose: $("#shareSaveGuideCloseBtn"),
    shareTrigger: $("#shareTriggerBtn"), downloadShare: $("#downloadShareBtn"), regenerateShare: $("#regenerateShareBtn"), continueEdit: $("#continueEditBtn"), shareClose: $("#shareCloseBtn"),
    clearDialog: $("#clearDialog"), undo: $("#undoBtn"), redo: $("#redoBtn"), clear: $("#clearBtn")
  };

  const state = {
    placed: [], selectedId: null, filter: "all", guides: false,
    view: { scale: 1, panX: 0, panY: 0 }, toolbar: { x: 20, y: 8 },
    undo: [], redo: [], previewId: null, immersive: false, mobileGuidePreference: "auto"
  };
  let saveTimer = 0;
  let press = null;
  let drag = null;
  let hoverTimer = 0;
  let previewHideTimer = 0;
  let previewCloseGuardUntil = 0;
  let detailPreloadTimer = 0;
  let detailPreloadScheduled = false;
  const detailPreloadCache = new Set();
  let toolbarDrag = null;
  let minimapDrag = null;
  let mobileGuideAutoHideTimer = 0;
  let mobileGuideCollapseTimer = 0;
  let listMomentumFrame = 0;
  let toastEl = null;
  let toastTimer = 0;
  let toastHideFrame = 0;
  let lastToastKey = "";
  let lastToastMessage = "";
  let lastToastType = "";
  let lastToastAt = 0;
  let shareResult = null;
  let shareWarmupStarted = false;
  const shareFileName = "与我周旋久-我的故事坐标.png";
  const stagePointers = new Map();
  let stageGesture = null;

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function stopListMomentum() {
    if (!listMomentumFrame) return;
    cancelAnimationFrame(listMomentumFrame);
    listMomentumFrame = 0;
  }

  function startListMomentum(velocity) {
    stopListMomentum();
    if (Math.abs(velocity) < .04) return;
    let lastTime = performance.now();
    const step = now => {
      const elapsed = Math.min(32, now - lastTime);
      lastTime = now;
      const before = dom.scroll.scrollTop;
      dom.scroll.scrollTop += velocity * elapsed;
      velocity *= Math.pow(.94, elapsed / 16.67);
      const reachedBoundary = dom.scroll.scrollTop === before;
      if (Math.abs(velocity) < .02 || reachedBoundary) {
        listMomentumFrame = 0;
        return;
      }
      listMomentumFrame = requestAnimationFrame(step);
    };
    listMomentumFrame = requestAnimationFrame(step);
  }

  function hardenLogoMedia(root = document) {
    root.querySelectorAll?.(".logo-card, .placed-logo, .preview-popover, .drag-ghost").forEach(element => {
      element.setAttribute("draggable", "false");
      element.style.webkitTouchCallout = "none";
      element.style.webkitUserSelect = "none";
      element.style.userSelect = "none";
    });
    root.querySelectorAll?.(".logo-card img, .placed-logo img, .preview-popover img, .drag-ghost img").forEach(img => {
      img.setAttribute("draggable", "false");
      img.setAttribute("contenteditable", "false");
      img.style.pointerEvents = "none";
      img.style.webkitUserDrag = "none";
      img.style.webkitTouchCallout = "none";
      img.style.webkitUserSelect = "none";
      img.style.userSelect = "none";
    });
  }

  function applyLibraryTouchMode() {
    const mobile = isMobile();
    dom.grid.querySelectorAll(".logo-card").forEach(card => {
      card.style.touchAction = mobile ? "none" : "pan-y";
    });
    hardenLogoMedia(dom.grid);
  }

  function mediaMarkup(logo, className = "", lazy = false) {
    if (logo.src) return `<img class="${className}" src="${logo.src}" alt="" draggable="false" contenteditable="false" decoding="async"${lazy ? ' loading="lazy"' : ""}>`;
    return `<span class="placeholder-mark ${className}" style="background:${logo.color}">${escapeHTML(logo.slot || logo.name)}</span>`;
  }

  function clonePlaced() {
    return state.placed.map(item => ({ id: item.id, x: item.x, y: item.y, z: item.z }));
  }

  function pushHistory() {
    state.undo.push(clonePlaced());
    if (state.undo.length > 60) state.undo.shift();
    state.redo = [];
  }

  function mutatePlaced(mutator, message = "") {
    pushHistory();
    mutator();
    state.selectedId = state.placed.some(item => item.id === state.selectedId) ? state.selectedId : null;
    renderAll();
    scheduleSave();
    if (message) toast(message, "", { key: `placed-mutation-${message}`, dedupe: 1200 });
  }

  function renderAll() {
    renderLibrary();
    renderPlaced();
    updateCounts();
    updateHistoryButtons();
    updateGuides();
    updateMobileGuide();
  }

  function renderLibrary() {
    const placedIds = new Set(state.placed.map(item => item.id));
    const visible = visibleLogos.filter(item => state.filter === "all" || !placedIds.has(item.id));
    const currentCards = dom.grid.querySelectorAll(".logo-card");
    if (currentCards.length !== visible.length) {
      dom.grid.innerHTML = visible.map((logo, index) => {
        const placed = placedIds.has(logo.id);
        const sequence = String(logos.indexOf(logo) + 1).padStart(2, "0");
        const label = logo.placeholder ? `占位碎片 ${sequence}` : logo.name;
        return `<button class="logo-card${placed ? " is-placed" : ""}${state.selectedId === logo.id ? " is-focused" : ""}" type="button" data-logo-id="${logo.id}" aria-label="${placed ? "定位已放置" : "放置"}${escapeHTML(label)}" aria-pressed="${state.selectedId === logo.id}">
          <span class="logo-thumb">${mediaMarkup(logo, "", true)}</span><span class="fragment-name">${formatFragmentName(logo.name)}</span>
        </button>`;
      }).join("");
      applyLibraryTouchMode();
    } else {
      currentCards.forEach(card => {
        const id = card.dataset.logoId;
        const placed = placedIds.has(id);
        const logo = logoMap.get(id);
        const sequence = String(logos.indexOf(logo) + 1).padStart(2, "0");
        const label = logo.placeholder ? `占位碎片 ${sequence}` : logo.name;
        card.classList.toggle("is-placed", placed);
        card.classList.toggle("is-focused", state.selectedId === id);
        card.setAttribute("aria-pressed", String(state.selectedId === id));
        card.setAttribute("aria-label", `${placed ? "定位已放置" : "放置"}${escapeHTML(label)}`);
      });
    }
    dom.empty.hidden = visible.length > 0;
  }

  function renderPlaced() {
    dom.placedLayer.innerHTML = [...state.placed].sort((a, b) => a.z - b.z).map(item => {
      const logo = logoMap.get(item.id);
      return `<button class="placed-logo${state.selectedId === item.id ? " is-selected" : ""}" type="button" data-logo-id="${item.id}" style="z-index:${item.z}" aria-label="${escapeHTML(logo.name)}，已放置在坐标 ${item.x.toFixed(2)}, ${item.y.toFixed(2)}">${mediaMarkup(logo)}</button>`;
    }).join("");
    hardenLogoMedia(dom.placedLayer);
    updatePlacedLayout();
  }

  function getBaseLogoSize(frameSize) {
    if (isMobile()) {
      return Math.min(58, Math.max(46, window.innerWidth * 0.14));
    }
    return Math.min(62, Math.max(44, frameSize * 0.072));
  }

  function updatePlacedLayout() {
    const frameSize = dom.frame.clientWidth;
    if (!frameSize) return;
    const scale = state.view.scale;
    const center = frameSize / 2;
    const usable = frameSize * 0.42;
    const logoSize = getBaseLogoSize(frameSize) * scale;
    const placedMap = new Map(state.placed.map(item => [item.id, item]));
    dom.placedLayer.querySelectorAll(".placed-logo").forEach(element => {
      const item = placedMap.get(element.dataset.logoId);
      if (!item) return;
      const left = center + state.view.panX + item.x * usable * scale;
      const top = center + state.view.panY - item.y * usable * scale;
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      element.style.width = `${logoSize}px`;
      element.style.height = `${logoSize}px`;
    });
  }

  function updateCounts() {
    const placed = state.placed.length;
    $$('[data-total]').forEach(el => { el.textContent = String(visibleLogos.length); });
    $("#placedCountDesktop").textContent = String(placed).padStart(2, "0");
    $("#placedCountMobile").textContent = String(placed).padStart(2, "0");
    if (dom.desktopProgressFill) dom.desktopProgressFill.style.width = `${Math.round((placed / visibleLogos.length) * 100)}%`;
    if (dom.shareTrigger) dom.shareTrigger.hidden = placed < MIN_SHARE_PLACED;
    if (placed >= MIN_SHARE_PLACED) warmupShareAssets();
    warmupPlacedDetails();
    $("#unplacedCount").textContent = String(visibleLogos.length - placed);
    dom.clear.disabled = placed === 0;
  }

  function updateHistoryButtons() {
    dom.undo.disabled = state.undo.length === 0;
    dom.redo.disabled = state.redo.length === 0;
  }

  function isGuideMotionLocked() {
    return Boolean(drag || press?.longReady || document.body.classList.contains("is-dragging-placed"));
  }

  function updateMobileGuide() {
    if (!dom.mobileInstruction) return;
    clearTimeout(mobileGuideAutoHideTimer);
    clearTimeout(mobileGuideCollapseTimer);
    state.mobileGuidePreference = "auto";
    dom.mobileInstruction.classList.remove("is-hiding", "is-collapsed", "is-locked");
    dom.mobileInstruction.hidden = false;
    dom.mobileInstruction.removeAttribute("aria-hidden");
    dom.mobileInstruction.dataset.mode = "full";
    if (dom.mobileGuideCompact) dom.mobileGuideCompact.setAttribute("aria-hidden", "true");
  }

  function setMobileGuidePreference() {
    state.mobileGuidePreference = "auto";
    updateMobileGuide();
  }

  function selectLogo(id) {
    state.selectedId = id;
    renderLibrary();
    renderPlaced();
    updateGuides();
    scheduleSave();
  }

  function placeAtOrigin(id) {
    if (state.placed.some(item => item.id === id)) {
      focusPlaced(id);
      return;
    }
    mutatePlaced(() => {
      state.placed.push({ id, x: 0, y: 0, z: nextZ() });
      state.selectedId = id;
    });
    announce(`${logoMap.get(id).name}已放置`);
    markOverlap(id);
  }

  function nextZ() { return Math.max(0, ...state.placed.map(item => item.z)) + 1; }

  function focusPlaced(id) {
    const item = state.placed.find(entry => entry.id === id);
    if (!item) return;
    state.selectedId = id;
    const usable = dom.frame.clientWidth * .42;
    state.view.panX = -item.x * usable * state.view.scale;
    state.view.panY = item.y * usable * state.view.scale;
    clampView();
    applyView();
    renderAll();
  }

  function removePlaced(id) {
    mutatePlaced(() => {
      state.placed = state.placed.filter(item => item.id !== id);
      if (state.selectedId === id) state.selectedId = null;
    });
    closePreview();
  }

  function movePlaced(id, point, isNew = false) {
    const existing = state.placed.find(item => item.id === id);
    mutatePlaced(() => {
      if (existing) {
        existing.x = point.x; existing.y = point.y; existing.z = nextZ();
      } else {
        state.placed.push({ id, x: point.x, y: point.y, z: nextZ() });
      }
      state.selectedId = id;
    });
    markOverlap(id);
  }

  function markOverlap(id) {
    const target = state.placed.find(item => item.id === id);
    if (!target) return;
    const overlap = state.placed.some(item => item.id !== id && Math.hypot(item.x - target.x, item.y - target.y) < .14);
    if (!overlap) return;
    requestAnimationFrame(() => {
      const el = dom.placedLayer.querySelector(`[data-logo-id="${id}"]`);
      el?.classList.add("is-overlap");
      toast("已叠放在上层", "", { key: "overlap", dedupe: 1400, duration: 1400 });
    });
  }

  function undo() {
    if (!state.undo.length) return;
    state.redo.push(clonePlaced());
    state.placed = state.undo.pop();
    if (!state.placed.some(item => item.id === state.selectedId)) state.selectedId = null;
    renderAll(); scheduleSave(); closePreview();
  }

  function redo() {
    if (!state.redo.length) return;
    state.undo.push(clonePlaced());
    state.placed = state.redo.pop();
    renderAll(); scheduleSave(); closePreview();
  }

  function clearAll() {
    if (!state.placed.length) return;
    mutatePlaced(() => { state.placed = []; state.selectedId = null; }, "已清空，可撤销恢复");
    closePreview();
  }

  function updateGuides() {
    dom.world.classList.toggle("guides-on", state.guides);
    const guideBtn = $("#guideBtn");
    guideBtn.setAttribute("aria-pressed", String(state.guides));
    guideBtn.setAttribute("aria-label", state.guides ? "关闭参考线" : "开启参考线");
    guideBtn.setAttribute("title", state.guides ? "关闭参考线" : "开启参考线");
    dom.guideLineY.style.left = `29%`;
    dom.guideLineY2.style.left = `71%`;
    dom.guideLineX.style.top = `29%`;
    dom.guideLineX2.style.top = `71%`;
  }

  function toast(message, type = "", options = {}) {
    const now = Date.now();
    const key = options.key || `${type}:${message}`;
    const dedupe = options.dedupe ?? 800;
    const sameKeyRecent = key === lastToastKey && now - lastToastAt < dedupe;
    const sameContent = message === lastToastMessage && type === lastToastType;
    const shouldUpdateContent = !sameKeyRecent || !sameContent;
    const duration = options.duration ?? (type === "error" ? 2600 : 1800);

    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      dom.toastStack.append(toastEl);
    }

    const currentErrorVisible = lastToastType === "error" && toastEl.classList.contains("is-visible");
    if (currentErrorVisible && type !== "error" && !options.force && now - lastToastAt < 1200) return;

    clearTimeout(toastTimer);
    cancelAnimationFrame(toastHideFrame);

    if (shouldUpdateContent) {
      toastEl.textContent = message;
      toastEl.className = `toast${type ? ` is-${type}` : ""}`;
      lastToastMessage = message;
      lastToastType = type;
    }
    lastToastKey = key;
    lastToastAt = now;

    toastHideFrame = requestAnimationFrame(() => toastEl?.classList.add("is-visible"));
    toastTimer = window.setTimeout(() => {
      toastEl?.classList.remove("is-visible");
    }, duration);
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      dialog.scrollTop = 0;
    } else {
      dialog.setAttribute("open", "");
      dialog.classList.add("is-fallback-open");
      dialog.scrollTop = 0;
    }
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else { dialog.removeAttribute("open"); dialog.classList.remove("is-fallback-open"); }
  }

  function updateShareSaveButton(ready = false) {
    if (!dom.downloadShare) return;
    if (!ready || !shareResult?.objectURL) {
      dom.downloadShare.removeAttribute("href");
      dom.downloadShare.setAttribute("aria-disabled", "true");
      return;
    }
    dom.downloadShare.href = shareResult.objectURL;
    dom.downloadShare.download = shareFileName;
    dom.downloadShare.setAttribute("aria-disabled", "false");
  }

  function supportsFileShare(file) {
    if (!navigator.canShare || !navigator.share || !file) return false;
    try {
      return navigator.canShare({ files: [file] });
    } catch (_) {
      return false;
    }
  }

  function getShareSignature() {
    return JSON.stringify([...state.placed]
      .sort((left, right) => left.z - right.z)
      .map(item => [item.id, Number(item.x.toFixed(4)), Number(item.y.toFixed(4)), item.z]));
  }

  function revokeShareResult(result = shareResult) {
    if (result?.objectURL) URL.revokeObjectURL(result.objectURL);
  }

  function renderSharePreview(result) {
    if (!result?.objectURL) return;
    dom.sharePreview.innerHTML = `<img src="${result.objectURL}" alt="宁荣荣与我周旋久结果图">`;
  }

  function warmupShareAssets() {
    if (shareWarmupStarted || !window.ShareCard?.warmupShareAssets) return;
    shareWarmupStarted = true;
    const run = () => window.ShareCard.warmupShareAssets();
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1800 });
    else window.setTimeout(run, 300);
  }

  function warmupDetail(id) {
    const src = logoMap.get(id)?.detail;
    if (!src || detailPreloadCache.has(src)) return;
    detailPreloadCache.add(src);
    const image = new Image();
    image.decoding = "async";
    image.src = withAssetVersion(src);
  }

  function warmupPlacedDetails() {
    if (detailPreloadScheduled) return;
    detailPreloadScheduled = true;
    clearTimeout(detailPreloadTimer);
    const run = deadline => {
      detailPreloadScheduled = false;
      const pending = state.placed.map(item => item.id).filter(id => {
        const src = logoMap.get(id)?.detail;
        return src && !detailPreloadCache.has(src);
      });
      if (!pending.length) return;
      const hasBudget = () => !deadline || deadline.timeRemaining() > 6 || deadline.didTimeout;
      while (pending.length && hasBudget()) warmupDetail(pending.shift());
      if (pending.length) warmupPlacedDetails();
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1600 });
    else detailPreloadTimer = window.setTimeout(() => run(), 240);
  }

  function hideShareSaveGuide() {
    if (!dom.shareSaveGuide) return;
    dom.shareSaveGuide.hidden = true;
    dom.shareSaveGuide.classList.remove("is-visible");
  }

  function showInlineSaveFallback() {
    if (!dom.shareSaveGuide) return;
    dom.shareSaveGuide.hidden = false;
    requestAnimationFrame(() => dom.shareSaveGuide?.classList.add("is-visible"));
    dom.shareSaveGuideClose?.focus({ preventScroll: true });
  }

  async function handleShareSave(event) {
    if (!shareResult?.objectURL) {
      event.preventDefault();
      return toast("结果图还在生成中", "", { key: "share-not-generated", dedupe: 1200 });
    }

    if (shareResult.file && supportsFileShare(shareResult.file)) {
      event.preventDefault();
      try {
        await navigator.share({ files: [shareResult.file], title: "宁荣荣·与我周旋久", text: "保存我的故事坐标" });
      } catch (error) {
        if (error?.name === "AbortError") return;
        showInlineSaveFallback();
      }
      return;
    }

    if (isIOS) {
      event.preventDefault();
      showInlineSaveFallback();
      return;
    }

    dom.downloadShare.href = shareResult.objectURL;
  }

    async function generateShareResult() {
      if (!window.ShareCard) return toast("结果图生成器未加载", "error", { key: "share-generator-missing" });
      if (state.placed.length < MIN_SHARE_PLACED) return toast(`放置 ${MIN_SHARE_PLACED} 个及以上碎片后生成她的人生坐标`, "", { key: "share-not-ready", dedupe: 1200 });

      const signature = getShareSignature();
      // 关闭结果图后 shareResult 已清空，每次都重新生成

      // 立即开始预加载结果图
      openDialog(dom.shareDialog);
      hideShareSaveGuide();
      warmupShareAssets();
      dom.sharePreview.innerHTML = "<span>正在生成结果图…</span>";
      updateShareSaveButton(false);

      const personality = window.ShareCard.calculatePersonality(state.placed);
      const preloadPromise = window.ShareCard.generateShareImage({
        placed: state.placed,
        logos,
        activityTitle: "宁荣荣·与我周旋久",
        subtitle: `${personality.result.name}·${personality.key}`,
        shareUrl: "https://ningrr.fun",
        userId: "佚名"
      });

      // 同时弹出 ID 蒙层
      const userId = await getUserIdFromUser();
      if (userId === null) {
        // 用户取消，关闭结果页
        closeDialog(dom.shareDialog);
        return;
      }

      // 等待预加载完成
      let result;
      try {
        result = await preloadPromise;
      } catch (error) {
        dom.sharePreview.innerHTML = "<span>生成失败，请稍后再试</span>";
        updateShareSaveButton(false);
        toast("结果图生成失败，请重试", "error", { key: "share-generation-failed" });
        return;
      }

      // 如果用户输入的 ID 不是"佚名"，需要重新生成
      if (userId !== "佚名") {
        revokeShareResult();
        shareResult = null;
        dom.sharePreview.innerHTML = "<span>正在生成结果图…</span>";
        updateShareSaveButton(false);
        try {
          result = await window.ShareCard.generateShareImage({
            placed: state.placed,
            logos,
            activityTitle: "宁荣荣·与我周旋久",
            subtitle: `${personality.result.name}·${personality.key}`,
            shareUrl: "https://ningrr.fun",
            userId
          });
        } catch (error) {
          dom.sharePreview.innerHTML = "<span>生成失败，请稍后再试</span>";
          updateShareSaveButton(false);
          toast("结果图生成失败，请重试", "error", { key: "share-generation-failed" });
          return;
        }
      }

      const { objectURL, blob } = result;
      const file = blob ? new File([blob], shareFileName, { type: "image/png" }) : null;
      shareResult = { signature, objectURL, blob, file };
      renderSharePreview(shareResult);
      updateShareSaveButton(true);
    }


  function getUserIdFromUser() {
    return new Promise(resolve => {
      // 从 localStorage 读取上次保存的 userId，预填到输入框
      const cachedUserId = localStorage.getItem("ningrongrong-2026-user-id") || "";
      dom.userIdInput.value = cachedUserId;
      openDialog(dom.userIdDialog);

      function cleanup() {
        dom.anonymousBtn.removeEventListener("click", onAnonymous);
        dom.confirmUserIdBtn.removeEventListener("click", onConfirm);
        dom.closeUserIdBtn.removeEventListener("click", onCloseBtn);
        dom.userIdDialog.removeEventListener("close", onClose);
      }

      function onAnonymous() {
        cleanup();
        dom.userIdDialog.close();
        resolve("佚名");
      }

      function onConfirm() {
        cleanup();
        dom.userIdDialog.close();
        const value = dom.userIdInput.value.trim();
        const finalValue = value || "佚名";
        // 保存到 localStorage，下次预填
        if (value) {
          localStorage.setItem("ningrongrong-2026-user-id", value);
        }
        resolve(finalValue);
      }

      function onClose() {
        cleanup();
        resolve(null); // 用户关闭对话框
      }

      function onCloseBtn() {
        dom.userIdDialog.close();
      }

      dom.anonymousBtn.addEventListener("click", onAnonymous);
      dom.confirmUserIdBtn.addEventListener("click", onConfirm);
      dom.closeUserIdBtn.addEventListener("click", onCloseBtn);
      dom.userIdDialog.addEventListener("close", onClose);

      // 输入框回车确认
      dom.userIdInput.onkeydown = (e) => {
        if (e.key === "Enter") onConfirm();
      };

      // 自动聚焦输入框
      setTimeout(() => dom.userIdInput.focus(), 100);
    });
  }

  function announce(message) { dom.live.textContent = message; }

  function applyView() {
    dom.world.style.transform = `translate(${state.view.panX}px, ${state.view.panY}px) scale(${state.view.scale})`;
    updatePlacedLayout();
    dom.zoomValue.textContent = `${Math.round(state.view.scale * 100)}%`;
    $("#zoomOutBtn").disabled = state.view.scale <= 1.001;
    updateMinimap();
  }

  function updateMinimap() {
    if (!dom.minimap || !dom.minimapViewport) return;
    const scale = state.view.scale;
    const frameSize = Math.max(1, dom.frame.clientWidth);
    const size = Math.min(1, 1 / scale);
    const centerX = .5 - state.view.panX / (scale * frameSize);
    const centerY = .5 - state.view.panY / (scale * frameSize);
    dom.minimapViewport.style.width = `${size * 100}%`;
    dom.minimapViewport.style.height = `${size * 100}%`;
    dom.minimapViewport.style.left = `${Math.max(0, Math.min(1 - size, centerX - size / 2)) * 100}%`;
    dom.minimapViewport.style.top = `${Math.max(0, Math.min(1 - size, centerY - size / 2)) * 100}%`;
    dom.minimap.classList.toggle("is-overview", scale <= 1.001);
    dom.minimap.setAttribute("aria-label", `当前画布位置预览，缩放 ${Math.round(scale * 100)}%，可点击或拖动定位`);
  }

  function moveViewFromMinimap(clientX, clientY) {
    if (isMobile() || !dom.minimap) return;
    const rect = dom.minimap.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const frameSize = Math.max(1, dom.frame.clientWidth);
    state.view.panX = -((x - .5) * state.view.scale * frameSize);
    state.view.panY = -((y - .5) * state.view.scale * frameSize);
    clampView(); applyView();
  }

  function clampView() {
    const size = dom.frame.clientWidth || 390;
    const maxPan = Math.max(0, size * (state.view.scale - 1) * .5);
    state.view.panX = Math.max(-maxPan, Math.min(maxPan, state.view.panX));
    state.view.panY = Math.max(-maxPan, Math.min(maxPan, state.view.panY));
  }

  function zoomTo(scale, clientX, clientY) {
    const old = state.view.scale;
    const next = Math.max(1, Math.min(2.2, scale));
    if (Math.abs(next - old) < .001) return;
    const rect = dom.frame.getBoundingClientRect();
    const px = (clientX ?? rect.left + rect.width / 2) - (rect.left + rect.width / 2);
    const py = (clientY ?? rect.top + rect.height / 2) - (rect.top + rect.height / 2);
    state.view.panX = px - (px - state.view.panX) * (next / old);
    state.view.panY = py - (py - state.view.panY) * (next / old);
    state.view.scale = next;
    clampView(); applyView(); scheduleSave();
  }

  function resetView() {
    state.view = { scale: 1, panX: 0, panY: 0 };
    applyView(); scheduleSave(); toast("已回到初始视角", "", { key: "reset-view", dedupe: 1200 });
  }

  function pointToLogical(clientX, clientY) {
    const rect = dom.frame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const worldX = (clientX - centerX - state.view.panX) / state.view.scale;
    const worldY = (clientY - centerY - state.view.panY) / state.view.scale;
    const usable = rect.width * .42;
    return { x: Math.max(-1, Math.min(1, worldX / usable)), y: Math.max(-1, Math.min(1, -worldY / usable)) };
  }

  function isPointInRect(x, y, rect) { return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom; }

  function startDrag(id, source, event) {
    const item = state.placed.find(entry => entry.id === id);
    const sourceElement = press?.element || null;
    drag = { id, source, pointerId: event.pointerId, sourceElement, startPlaced: item ? { ...item } : null, x: event.clientX, y: event.clientY };
    press = null;
    clearTimeout(hoverTimer);
    clearTimeout(previewDelayTimer);
    closePreview();
    const logo = logoMap.get(id);
    dom.ghost.innerHTML = mediaMarkup(logo);
    hardenLogoMedia(dom.ghost);
    dom.ghost.classList.add("is-active");
    updateDrag(event.clientX, event.clientY);
    document.body.classList.add("is-logo-dragging");
    if (source === "placed") {
      document.body.classList.add("is-dragging-placed");
    }
    navigator.vibrate?.(12);
  }

  function updateDrag(x, y) {
    if (!drag) return;
    drag.x = x; drag.y = y;
    // 直接使用手指位置，不添加偏移
    dom.ghost.style.left = `${x}px`;
    dom.ghost.style.top = `${y}px`;
    const frameRect = dom.frame.getBoundingClientRect();
    const inFrame = isPointInRect(x, y, frameRect);
    dom.frame.classList.toggle("is-drop-valid", inFrame);
  }

  function finishDrag(event, cancelled = false) {
    if (!drag) return;
    const current = drag;
    const frameRect = dom.frame.getBoundingClientRect();
    const returnRect = dom.libraryHead.getBoundingClientRect();
    const inFrame = isPointInRect(event.clientX, event.clientY, frameRect);
    const inReturn = current.source === "placed" && isPointInRect(event.clientX, event.clientY, returnRect);
    cleanupDrag();
    if (cancelled) { return; }
    if (inReturn) { removePlaced(current.id); return; }
    if (inFrame) {
      movePlaced(current.id, pointToLogical(event.clientX, event.clientY), current.source === "library");
      return;
    }
    dom.frame.classList.add("is-drop-invalid");
    window.setTimeout(() => dom.frame.classList.remove("is-drop-invalid"), 420);
    const invalidDropMessage = current.source === "placed" ? "未进入有效区域，已回到原位置" : "请将碎片放入坐标区域";
    toast(invalidDropMessage, "error", { key: `invalid-drop-${current.source}`, dedupe: 1400 });
  }

  let dragJustFinished = false;
  let previewDelayTimer = 0;

  function cleanupDrag() {
    drag?.sourceElement?.classList.remove("is-holding", "is-drag-ready");
    dom.ghost.classList.remove("is-active");
    dom.ghost.innerHTML = "";
    dom.frame.classList.remove("is-drop-valid");
    document.body.classList.remove("is-logo-dragging", "is-dragging-placed");
    drag = null;
    dragJustFinished = true;
    setTimeout(() => { dragJustFinished = false; }, 200);
  }

  function handleLogoPointerDown(event, source) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    // 清理旧的 press 对象，避免状态残留
    if (press && press.pointerId !== event.pointerId) {
      clearTimeout(press.timer);
      press.element?.classList.remove("is-holding", "is-drag-ready");
      press = null;
    }
    const button = source === "placed" ? findLogoAtPoint(event) : event.target.closest(".logo-card");
    if (!button) return;
    if (event.pointerType !== "mouse") event.preventDefault();
    const id = button.dataset.logoId;
    if (source === "library" && isMobile()) stopListMomentum();
    if (source === "library" && state.placed.some(item => item.id === id)) {
      press = {
        id, source, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
        moved: false, placedLibrary: true, scrolling: false,
        lastY: event.clientY, lastTime: performance.now(), scrollVelocity: 0
      };
      button.setPointerCapture?.(event.pointerId);
      return;
    }
    if (source === "placed") {
      state.selectedId = id;
      dom.grid.querySelectorAll(".logo-card").forEach(card => {
        card.classList.toggle("is-focused", card.dataset.logoId === id);
        card.setAttribute("aria-pressed", String(card.dataset.logoId === id));
      });
      dom.placedLayer.querySelectorAll(".placed-logo").forEach(el => el.classList.toggle("is-selected", el.dataset.logoId === id));
      updateGuides();
      scheduleSave();
      button.blur();
    }
    press = {
      id, source, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      moved: false, longReady: false, timer: 0, scrolling: false,
      lastY: event.clientY, lastTime: performance.now(), scrollVelocity: 0,
      element: button
    };
    button.setPointerCapture?.(event.pointerId);
    if (source === "library" && isMobile()) {
      button.classList.add("is-holding");
      press.timer = window.setTimeout(() => {
        if (press && press.id === id && !press.moved) {
          press.longReady = true;
          press.element.classList.remove("is-holding");
          press.element.classList.add("is-drag-ready");
          navigator.vibrate?.(18);
          announce("已拾取碎片，可以拖动放置");
          startDrag(id, source, event);
        }
      }, 280);
    }
  }

  function onGlobalPointerMove(event) {
    if (toolbarDrag && toolbarDrag.pointerId === event.pointerId) {
      moveToolbar(toolbarDrag.baseX + event.clientX - toolbarDrag.startX, toolbarDrag.baseY - (event.clientY - toolbarDrag.startY));
      event.preventDefault(); return;
    }
    if (drag && drag.pointerId === event.pointerId) {
      updateDrag(event.clientX, event.clientY); event.preventDefault(); return;
    }
    if (!press || press.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    const threshold = isMobile() ? 8 : 4;
    if (isMobile() && press.source === "library") {
      if (!press.scrolling && distance > threshold) {
        press.moved = true;
        press.scrolling = true;
        press.lastY = event.clientY;
        press.lastTime = performance.now();
        clearTimeout(press.timer);
        press.element?.classList.remove("is-holding", "is-drag-ready");
      } else if (press.scrolling) {
        const now = performance.now();
        const elapsed = Math.max(1, now - press.lastTime);
        const deltaY = press.lastY - event.clientY;
        dom.scroll.scrollTop += deltaY;
        press.scrollVelocity = deltaY / elapsed;
        press.lastY = event.clientY;
        press.lastTime = now;
      }
      if (press.scrolling) event.preventDefault();
      return;
    }
    if (distance <= threshold) return;
    press.moved = true;
    clearTimeout(press.timer);
    if (press.placedLibrary) return;
    if (!isMobile() || press.source === "placed") {
      const snapshot = { ...press };
      startDrag(snapshot.id, snapshot.source, event);
      event.preventDefault();
    }
  }

  function onGlobalPointerUp(event) {
    if (toolbarDrag?.pointerId === event.pointerId) {
      dom.toolbar.classList.remove("is-dragging");
      toolbarDrag = null;
      snapToolbarToEdge();
      scheduleSave();
      return;
    }
    if (drag?.pointerId === event.pointerId) { finishDrag(event); return; }
    if (!press || press.pointerId !== event.pointerId) return;
    clearTimeout(press.timer);
    press.element?.classList.remove("is-holding", "is-drag-ready");
    const current = press; press = null;
    if (current.scrolling) {
      startListMomentum(current.scrollVelocity);
      return;
    }
    if (current.moved) return;
    if (current.source === "library") {
      if (current.placedLibrary) focusPlaced(current.id);
      else placeAtOrigin(current.id);
    } else if (isMobile()) {
      // 精准点击检测：只在点击非透明像素时触发预览
      if (!isClickOnOpaquePixel(event, current.element)) return;
      event.preventDefault();
      warmupDetail(current.id);
      openPreview(current.id, current.element);
    }
  }

  function onGlobalPointerCancel(event) {
    clearTimeout(press?.timer);
    press?.element?.classList.remove("is-holding", "is-drag-ready");
    if (drag?.pointerId === event.pointerId) finishDrag(event, true);
    if (press?.pointerId === event.pointerId) press = null;
    if (toolbarDrag?.pointerId === event.pointerId) {
      dom.toolbar.classList.remove("is-dragging");
      toolbarDrag = null;
    }
  }

  // 检测点击是否在图片的非透明像素上
  function isClickOnOpaquePixel(event, element) {
    const img = element.querySelector("img");
    if (!img || !img.complete || img.naturalWidth === 0) return true; // 图片未加载时默认允许点击

    const rect = img.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return false;

    // 计算相对于图片原始尺寸的坐标
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const srcX = Math.floor(x * scaleX);
    const srcY = Math.floor(y * scaleY);

    // 创建离屏 Canvas 检测像素 alpha
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, srcX, srcY, 1, 1, 0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    return pixel[3] > 20; // alpha 阈值，避免边缘抗锯齿误判
  }

  // 找到点击位置对应的 logo（考虑重叠和透明区域）
  function findLogoAtPoint(event) {
    const logos = [...dom.placedLayer.querySelectorAll(".placed-logo")];
    // 按 z-index 从高到低排序
    logos.sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0));

    for (const logo of logos) {
      const rect = logo.getBoundingClientRect();
      // 检查点击是否在 logo 的矩形范围内
      if (event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) {
        // 检查是否在非透明像素上
        if (isClickOnOpaquePixel(event, logo)) {
          return logo;
        }
      }
    }
    return null;
  }

  function openPreview(id, anchor) {
    const logo = logoMap.get(id);
    if (!logo) return;
    state.previewId = id;
    window.getSelection?.()?.removeAllRanges?.();
    previewCloseGuardUntil = performance.now() + 420;
    const detailSrc = logo.detail ? withAssetVersion(logo.detail) : "";
    dom.previewMedia.innerHTML = detailSrc
      ? `<img src="${detailSrc}" alt="${escapeHTML(logo.name)}大图" draggable="false" contenteditable="false" decoding="async">`
      : `<div class="preview-placeholder" style="background:${logo.color}"></div>`;
    hardenLogoMedia(dom.preview);
    dom.preview.hidden = false;
    dom.previewBackdrop.classList.add("is-visible");
    const anchorEl = anchor?.closest?.(".placed-logo") || dom.placedLayer.querySelector(`[data-logo-id="${id}"]`);
    const previewImage = dom.previewMedia.querySelector("img");
    const showPreview = () => {
      // 统一最长边约束，让横图和竖图的最长边一致
      if (previewImage && previewImage.complete && previewImage.naturalWidth > 0) {
        const maxLongEdge = Math.min(310, window.innerWidth - 38);
        const { naturalWidth, naturalHeight } = previewImage;
        const longEdge = Math.max(naturalWidth, naturalHeight);
        const scale = maxLongEdge / longEdge;
        previewImage.style.width = `${naturalWidth * scale}px`;
        previewImage.style.height = `${naturalHeight * scale}px`;
        previewImage.style.maxWidth = "none";
        previewImage.style.maxHeight = "none";
      }
      requestAnimationFrame(() => {
        positionPreview(anchorEl);
        dom.preview.classList.add("is-visible");
      });
    };
    if (previewImage) {
      previewImage.draggable = false;
      previewImage.style.webkitUserDrag = "none";
      previewImage.style.webkitTouchCallout = "none";
      previewImage.style.webkitUserSelect = "none";
    }
    if (previewImage && !previewImage.complete) {
      previewImage.addEventListener("load", showPreview, { once: true });
      previewImage.addEventListener("error", showPreview, { once: true });
    } else {
      showPreview();
    }
  }

  function positionPreview(anchor) {
    if (!anchor) return;
    const a = anchor.getBoundingClientRect();
    const p = dom.preview.getBoundingClientRect();
    const gap = 12;
    let left = a.right + gap;
    if (left + p.width > window.innerWidth - 10) left = a.left - p.width - gap;
    let top = a.top + a.height / 2 - p.height / 2;
    top = Math.max(10, Math.min(window.innerHeight - p.height - 10, top));
    left = Math.max(10, Math.min(window.innerWidth - p.width - 10, left));
    dom.preview.style.left = `${left}px`; dom.preview.style.top = `${top}px`;
  }

  function closePreview(force = false) {
    if (!force && isMobile() && performance.now() < previewCloseGuardUntil) return;
    clearTimeout(hoverTimer); clearTimeout(previewHideTimer);
    dom.preview.classList.remove("is-visible");
    dom.previewBackdrop.classList.remove("is-visible");
    state.previewId = null;
    window.setTimeout(() => { if (!state.previewId) dom.preview.hidden = true; }, 160);
  }

  function handlePlacedHover(event) {
    if (isMobile() || event.pointerType === "touch") return;
    if (dragJustFinished) return;
    const target = findLogoAtPoint(event);
    if (!target) return;
    clearTimeout(hoverTimer);
    clearTimeout(previewHideTimer);
    hoverTimer = window.setTimeout(() => openPreview(target.dataset.logoId, target), 250);
  }

  function handlePlacedLeave(event) {
    if (isMobile()) return;
    const target = findLogoAtPoint(event);
    if (!target || target.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    previewHideTimer = window.setTimeout(closePreview, 80);
  }

  function startStageGesture(event) {
    if (event.target.closest(".placed-logo, .coordinate-toolbar")) return;
    if (isMobile() && state.previewId) {
      closePreview();
      event.preventDefault();
      return;
    }
    dom.frame.setPointerCapture?.(event.pointerId);
    stagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (stagePointers.size === 1) {
      stageGesture = { type: "pan", startX: event.clientX, startY: event.clientY, panX: state.view.panX, panY: state.view.panY, moved: false };
      dom.frame.classList.add("is-panning");
    } else if (stagePointers.size === 2) {
      const pts = [...stagePointers.values()];
      stageGesture = { type: "pinch", distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), scale: state.view.scale, panX: state.view.panX, panY: state.view.panY, centerX: (pts[0].x + pts[1].x) / 2, centerY: (pts[0].y + pts[1].y) / 2 };
    }
  }

  function moveStageGesture(event) {
    if (!stagePointers.has(event.pointerId) || !stageGesture) return;
    stagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (stagePointers.size >= 2) {
      const pts = [...stagePointers.values()].slice(0, 2);
      if (stageGesture.type !== "pinch") {
        stageGesture = { type: "pinch", distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), scale: state.view.scale, panX: state.view.panX, panY: state.view.panY, centerX: (pts[0].x + pts[1].x) / 2, centerY: (pts[0].y + pts[1].y) / 2 };
      }
      const dist = Math.max(20, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      const scale = Math.max(1, Math.min(2.2, stageGesture.scale * dist / Math.max(20, stageGesture.distance)));
      const centerX = (pts[0].x + pts[1].x) / 2, centerY = (pts[0].y + pts[1].y) / 2;
      state.view.scale = scale;
      state.view.panX = stageGesture.panX + centerX - stageGesture.centerX;
      state.view.panY = stageGesture.panY + centerY - stageGesture.centerY;
    } else if (stageGesture.type === "pan") {
      if (Math.hypot(event.clientX - stageGesture.startX, event.clientY - stageGesture.startY) > 4) stageGesture.moved = true;
      state.view.panX = stageGesture.panX + event.clientX - stageGesture.startX;
      state.view.panY = stageGesture.panY + event.clientY - stageGesture.startY;
    }
    clampView(); applyView(); event.preventDefault();
  }

  function endStageGesture(event) {
    const wasBlankTap = stagePointers.size === 1 && stageGesture?.type === "pan" && !stageGesture.moved;
    stagePointers.delete(event.pointerId);
    if (!stagePointers.size) {
      stageGesture = null; dom.frame.classList.remove("is-panning"); scheduleSave();
      if (wasBlankTap && state.selectedId) {
        state.selectedId = null;
        closePreview();
        dom.grid.querySelectorAll(".logo-card").forEach(card => {
          card.classList.remove("is-focused");
          card.setAttribute("aria-pressed", "false");
        });
        dom.placedLayer.querySelectorAll(".placed-logo").forEach(el => el.classList.remove("is-selected"));
        updateGuides();
      }
    } else if (stagePointers.size === 1) {
      const p = [...stagePointers.values()][0];
      stageGesture = { type: "pan", startX: p.x, startY: p.y, panX: state.view.panX, panY: state.view.panY };
    }
  }

  function moveToolbar(x, y) {
    if (!isMobile()) return;
    const frame = dom.frame.getBoundingClientRect();
    const tool = dom.toolbar.getBoundingClientRect();
    const host = dom.toolbar.offsetParent?.getBoundingClientRect() || frame;
    const frameOffsetX = frame.left - host.left;
    const frameBottomOffset = host.bottom - frame.bottom;
    state.toolbar.x = Math.max(frameOffsetX + 6, Math.min(frameOffsetX + frame.width - tool.width - 6, x));
    state.toolbar.y = Math.max(frameBottomOffset + 6, Math.min(frameBottomOffset + frame.height - tool.height - 6, y));
    dom.toolbar.style.left = `${state.toolbar.x}px`;
    dom.toolbar.style.bottom = `${state.toolbar.y}px`;
  }

  function snapToolbarToEdge() {
    if (!isMobile()) return;
    const frame = dom.frame.getBoundingClientRect();
    const tool = dom.toolbar.getBoundingClientRect();
    const host = dom.toolbar.offsetParent?.getBoundingClientRect() || frame;
    const frameOffsetX = frame.left - host.left;
    const frameBottomOffset = host.bottom - frame.bottom;
    const inset = 8;
    const left = frameOffsetX + inset;
    const right = frameOffsetX + frame.width - tool.width - inset;
    const bottom = frameBottomOffset + inset;
    const top = frameBottomOffset + frame.height - tool.height - inset;
    const currentCenterX = state.toolbar.x + tool.width / 2;
    const currentCenterY = state.toolbar.y + tool.height / 2;
    const clampedX = Math.max(left, Math.min(right, state.toolbar.x));
    const clampedY = Math.max(bottom, Math.min(top, state.toolbar.y));
    const edgeTargets = [
      { x: left, y: clampedY },
      { x: right, y: clampedY },
      { x: clampedX, y: bottom },
      { x: clampedX, y: top }
    ];
    const cornerTargets = [
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: left, y: top },
      { x: right, y: top }
    ];
    const nearestCorner = cornerTargets.reduce((best, target) => {
      const centerX = target.x + tool.width / 2;
      const centerY = target.y + tool.height / 2;
      const distance = Math.hypot(centerX - currentCenterX, centerY - currentCenterY);
      return distance < best.distance ? { ...target, distance } : best;
    }, { ...cornerTargets[0], distance: Infinity });
    const nearestEdge = edgeTargets.reduce((best, target) => {
      const centerX = target.x + tool.width / 2;
      const centerY = target.y + tool.height / 2;
      const distance = Math.hypot(centerX - currentCenterX, centerY - currentCenterY);
      return distance < best.distance ? { ...target, distance } : best;
    }, { ...edgeTargets[0], distance: Infinity });
    const cornerThreshold = Math.min(frame.width, frame.height) * 0.22;
    const nearest = nearestCorner.distance <= cornerThreshold ? nearestCorner : nearestEdge;
    dom.toolbar.classList.add("is-snapping");
    moveToolbar(nearest.x, nearest.y);
    window.setTimeout(() => dom.toolbar.classList.remove("is-snapping"), 220);
  }

  function resetToolbarIfNeeded() {
    if (!isMobile()) {
      dom.toolbar.style.left = "";
      dom.toolbar.style.right = "";
      dom.toolbar.style.bottom = "";
      return;
    }
    dom.toolbar.style.right = "auto";
    moveToolbar(state.toolbar.x, state.toolbar.y);
  }

  async function toggleFullscreen() {
    if (state.immersive || document.fullscreenElement) {
      if (document.fullscreenElement) await document.exitFullscreen?.().catch(() => {});
      setImmersive(false); return;
    }
    let native = false;
    if (!isIOS && document.documentElement.requestFullscreen) {
      try { await document.documentElement.requestFullscreen(); native = true; } catch (_) { native = false; }
    }
    setImmersive(true);
    toast(native ? "已进入全屏" : "当前浏览器使用沉浸模式", "", { key: "enter-fullscreen", dedupe: 1200 });
  }

  function setImmersive(on) {
    state.immersive = on;
    document.body.classList.toggle("is-immersive", on);
    $("#fullscreenBtn").setAttribute("aria-pressed", String(on));
    $("#fullscreenBtn").setAttribute("aria-label", on ? "退出全屏" : "进入全屏");
    requestAnimationFrame(() => { clampView(); applyView(); resetToolbarIfNeeded(); });
  }

  function savePayload() {
    const usable = Math.max(1, dom.frame.clientWidth * .42);
    const frame = dom.frame.getBoundingClientRect();
    const host = dom.toolbar.offsetParent?.getBoundingClientRect() || frame;
    const toolbarLocalX = state.toolbar.x - (frame.left - host.left);
    const toolbarLocalY = state.toolbar.y - (host.bottom - frame.bottom);
    return {
      version: 1, activityId: ACTIVITY_ID, updatedAt: Date.now(),
      placed: clonePlaced(), selectedId: state.selectedId, filter: state.filter, guides: state.guides,
      viewportTransform: { scale: state.view.scale, centerX: -state.view.panX / (state.view.scale * usable), centerY: state.view.panY / (state.view.scale * usable) },
      toolbar: { xRatio: toolbarLocalX / Math.max(1, frame.width), yRatio: toolbarLocalY / Math.max(1, frame.height) }
    };
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 400);
  }

  function saveNow() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savePayload())); } catch (_) { /* private mode/storage disabled */ }
  }

  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (saved.activityId !== ACTIVITY_ID || saved.version !== 1 || Date.now() - saved.updatedAt > STORAGE_TTL) return false;
      state.placed = Array.isArray(saved.placed) ? saved.placed.map(item => ({ ...item, id: migrateLogoId(item.id) })).filter(item => logoMap.has(item.id) && Number.isFinite(item.x) && Number.isFinite(item.y)).map((item, i) => ({ id: item.id, x: Math.max(-1, Math.min(1, item.x)), y: Math.max(-1, Math.min(1, item.y)), z: Number.isFinite(item.z) ? item.z : i + 1 })) : [];
      const restoredSelectedId = migrateLogoId(saved.selectedId);
      state.selectedId = state.placed.some(item => item.id === restoredSelectedId) ? restoredSelectedId : null;
      state.filter = saved.filter === "unplaced" ? "unplaced" : "all";
      state.guides = Boolean(saved.guides);
      state._savedView = saved.viewportTransform;
      state._savedToolbar = saved.toolbar;
      return state.placed.length > 0;
    } catch (_) { return false; }
  }

  function applyRestoredLayout() {
    if (state._savedView) {
      const usable = Math.max(1, dom.frame.clientWidth * .42);
      state.view.scale = Math.max(1, Math.min(2.2, Number(state._savedView.scale) || 1));
      state.view.panX = -(Number(state._savedView.centerX) || 0) * state.view.scale * usable;
      state.view.panY = (Number(state._savedView.centerY) || 0) * state.view.scale * usable;
      delete state._savedView;
    }
    if (state._savedToolbar) {
      const frame = dom.frame.getBoundingClientRect();
      const host = dom.toolbar.offsetParent?.getBoundingClientRect() || frame;
      state.toolbar.x = frame.left - host.left + (Number(state._savedToolbar.xRatio) || .04) * frame.width;
      state.toolbar.y = host.bottom - frame.bottom + (Number(state._savedToolbar.yRatio) || .04) * frame.height;
      delete state._savedToolbar;
    }
    clampView(); applyView(); resetToolbarIfNeeded();
  }

  function bindEvents() {
    dom.grid.addEventListener("pointerdown", event => handleLogoPointerDown(event, "library"));
    dom.placedLayer.addEventListener("pointerdown", event => handleLogoPointerDown(event, "placed"));
    dom.grid.addEventListener("click", event => {
      if (event.detail !== 0) return;
      const card = event.target.closest(".logo-card");
      if (!card) return;
      state.placed.some(item => item.id === card.dataset.logoId) ? focusPlaced(card.dataset.logoId) : placeAtOrigin(card.dataset.logoId);
    });
    dom.placedLayer.addEventListener("click", event => {
      if (event.detail !== 0) return;
      if (dragJustFinished) { dragJustFinished = false; return; }
      const item = findLogoAtPoint(event);
      if (!item) return;
      selectLogo(item.dataset.logoId);
      clearTimeout(previewDelayTimer);
      previewDelayTimer = setTimeout(() => {
        openPreview(item.dataset.logoId, item);
      }, 200);
    });
    dom.placedLayer.addEventListener("pointerover", handlePlacedHover);
    dom.placedLayer.addEventListener("pointerout", handlePlacedLeave);
    dom.placedLayer.addEventListener("focusin", event => {
      if (drag || (press && press.moved) || dragJustFinished) return;
      const el = event.target.closest(".placed-logo"); if (el && !isMobile()) openPreview(el.dataset.logoId, el);
    });
    dom.placedLayer.addEventListener("focusout", event => { if (!isMobile() && !event.relatedTarget?.closest?.(".preview-popover")) closePreview(); });
    document.addEventListener("pointermove", onGlobalPointerMove, { passive: false });
    document.addEventListener("pointerup", onGlobalPointerUp);
    document.addEventListener("pointercancel", onGlobalPointerCancel);
    document.addEventListener("pointerdown", event => {
      if (isMobile() && state.previewId && !event.target.closest(".placed-logo, .preview-popover, .preview-backdrop")) closePreview();
    }, true);
    const suppressNativeTouchMenu = event => {
      if (!isMobile()) return;
      if (!event.target.closest(".logo-card, .placed-logo, .preview-popover, .drag-ghost")) return;
      event.preventDefault();
      event.stopPropagation();
      window.getSelection?.()?.removeAllRanges?.();
    };
    [document, dom.grid, dom.placedLayer, dom.preview, dom.ghost].forEach(element => {
      ["contextmenu", "dragstart", "selectstart", "copy", "cut"].forEach(type => {
        element.addEventListener(type, suppressNativeTouchMenu, { capture: true });
      });
    });
    dom.previewBackdrop.addEventListener("pointerdown", event => {
      event.preventDefault();
      event.stopPropagation();
      closePreview(true);
    });
    dom.previewBackdrop.addEventListener("click", () => closePreview());
    dom.preview.addEventListener("pointerdown", event => {
      if (isMobile()) event.preventDefault();
    });
    dom.preview.addEventListener("click", () => closePreview());
    dom.mobileGuideCollapseBtn?.addEventListener("click", () => setMobileGuidePreference("hidden"));
    dom.shareTrigger?.addEventListener("click", generateShareResult);
    dom.downloadShare?.addEventListener("click", handleShareSave);
    dom.shareSaveGuideClose?.addEventListener("click", hideShareSaveGuide);
    dom.regenerateShare?.addEventListener("click", regenerateShareResult);
    dom.continueEdit?.addEventListener("click", () => { hideShareSaveGuide(); closeDialog(dom.shareDialog); revokeShareResult(); shareResult = null; });
    dom.shareClose?.addEventListener("click", () => { hideShareSaveGuide(); closeDialog(dom.shareDialog); revokeShareResult(); shareResult = null; });
    dom.shareDialog?.addEventListener("click", event => { if (event.target === dom.shareDialog) { hideShareSaveGuide(); closeDialog(dom.shareDialog); revokeShareResult(); shareResult = null; } });

    dom.frame.addEventListener("pointerdown", startStageGesture);
    dom.frame.addEventListener("pointermove", moveStageGesture, { passive: false });
    dom.frame.addEventListener("pointerup", endStageGesture);
    dom.frame.addEventListener("pointercancel", endStageGesture);
    dom.frame.addEventListener("wheel", event => {
      if (isMobile()) return;
      event.preventDefault(); zoomTo(state.view.scale * Math.exp(-event.deltaY * .0014), event.clientX, event.clientY);
    }, { passive: false });

    dom.toolbarHandle.addEventListener("pointerdown", event => {
      if (!isMobile()) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.stopPropagation(); dom.toolbarHandle.setPointerCapture?.(event.pointerId);
      dom.toolbar.classList.add("is-dragging");
      toolbarDrag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, baseX: state.toolbar.x, baseY: state.toolbar.y };
    });
    dom.minimap?.addEventListener("pointerdown", event => {
      if (isMobile() || event.button !== 0) return;
      minimapDrag = event.pointerId;
      dom.minimap.setPointerCapture?.(event.pointerId);
      moveViewFromMinimap(event.clientX, event.clientY);
      event.preventDefault();
    });
    dom.minimap?.addEventListener("pointermove", event => {
      if (minimapDrag !== event.pointerId) return;
      moveViewFromMinimap(event.clientX, event.clientY);
      event.preventDefault();
    });
    const finishMinimapDrag = event => {
      if (minimapDrag !== event.pointerId) return;
      minimapDrag = null;
      scheduleSave();
    };
    dom.minimap?.addEventListener("pointerup", finishMinimapDrag);
    dom.minimap?.addEventListener("pointercancel", finishMinimapDrag);
    $("#zoomOutBtn").addEventListener("click", () => zoomTo(state.view.scale - .15));
    $("#zoomInBtn").addEventListener("click", () => zoomTo(state.view.scale + .15));
    $("#resetViewBtn").addEventListener("click", resetView);
    $("#guideBtn").addEventListener("click", () => {
      state.guides = !state.guides;
      updateGuides();
      scheduleSave();
      toast(state.guides ? "参考线已开启" : "参考线已关闭", "", { key: "guide-toggle", dedupe: 250, duration: 1500 });
    });
    $("#fullscreenBtn").addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && state.immersive) setImmersive(false); });

    $$(".filter-btn").forEach(button => button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      $$(".filter-btn").forEach(item => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
      renderLibrary(); scheduleSave();
    }));
    dom.undo.addEventListener("click", undo);
    dom.redo.addEventListener("click", redo);
    const openClearDialog = () => {
      if (typeof dom.clearDialog.showModal === "function") dom.clearDialog.showModal();
      else { dom.clearDialog.setAttribute("open", ""); dom.clearDialog.classList.add("is-fallback-open"); }
    };
    const closeClearDialog = () => {
      if (typeof dom.clearDialog.close === "function") dom.clearDialog.close();
      else { dom.clearDialog.removeAttribute("open"); dom.clearDialog.classList.remove("is-fallback-open"); }
    };
    dom.clear.addEventListener("click", openClearDialog);
    $("#cancelClearBtn").addEventListener("click", closeClearDialog);
    $("#confirmClearBtn").addEventListener("click", () => { closeClearDialog(); clearAll(); });
    dom.clearDialog.addEventListener("click", event => { if (event.target === dom.clearDialog) closeClearDialog(); });

    document.addEventListener("keydown", event => {
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (event.key === "Escape" && state.immersive && !document.fullscreenElement) setImmersive(false);
    });

    window.addEventListener("resize", () => {
      closePreview(); requestAnimationFrame(() => { applyLibraryTouchMode(); clampView(); applyView(); resetToolbarIfNeeded(); });
    });
    window.visualViewport?.addEventListener("resize", () => requestAnimationFrame(resetToolbarIfNeeded));
    window.addEventListener("pagehide", saveNow);
    window.addEventListener("storage", event => {
      if (event.key === STORAGE_KEY && event.newValue) toast("另一页面已更新本地进度，刷新后可载入", "", { key: "storage-updated", dedupe: 3000, duration: 2200 });
    });

    document.addEventListener("error", event => {
      if (!(event.target instanceof HTMLImageElement)) return;
      const host = event.target.parentElement;
      const fallback = document.createElement("span");
      fallback.className = "placeholder-mark";
      fallback.style.background = "#d8cab4";
      if (!event.target.closest(".preview-popover")) {
        const logoId = event.target.closest("[data-logo-id]")?.dataset.logoId;
        fallback.textContent = logoMap.get(logoId)?.slot || logoId || "图片加载失败";
      }
      event.target.replaceWith(fallback);
    }, true);
  }

  function init() {
    const restored = restore();
    bindEvents();
    renderAll();
    $$(".filter-btn").forEach(item => { const active = item.dataset.filter === state.filter; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
    requestAnimationFrame(() => {
      applyRestoredLayout();
      if (restored) toast("已恢复你上次的放置进度", "", { key: "progress-restored", dedupe: 3000, duration: 1600 });
    });
  }

  init();
})();

  function regenerateShareResult() {
    if (!window.ShareCard) return toast("结果图生成器未加载", "error", { key: "share-generator-missing" });
    if (state.placed.length < MIN_SHARE_PLACED) return toast(`放置 ${MIN_SHARE_PLACED} 个及以上碎片后生成她的人生坐标`, "", { key: "share-not-ready", dedupe: 1200 });

    openDialog(dom.shareDialog);
    hideShareSaveGuide();
    warmupShareAssets();
    const signature = getShareSignature();
    if (shareResult?.signature === signature && shareResult.objectURL) {
      renderSharePreview(shareResult);
      updateShareSaveButton(true);
      return;
    }
    revokeShareResult();
    shareResult = null;
    dom.sharePreview.innerHTML = "<span>正在生成结果图…</span>";
    updateShareSaveButton(false);
    try {
      const personality = window.ShareCard.calculatePersonality(state.placed);
      const userId = shareResult?.userId || "佚名";
      window.ShareCard.generateShareImage({
        placed: state.placed,
        logos,
        activityTitle: "宁荣荣·与我周旋久",
        subtitle: `${personality.result.name}·${personality.key}`,
        shareUrl: "https://ningrr.fun",
        userId
      }).then(({ objectURL, blob }) => {
        const file = blob ? new File([blob], shareFileName, { type: "image/png" }) : null;
        shareResult = { signature, objectURL, blob, file, userId };
        renderSharePreview(shareResult);
        updateShareSaveButton(true);
      }).catch(() => {
        shareResult = null;
        dom.sharePreview.innerHTML = "<span>生成失败，请稍后再试</span>";
        updateShareSaveButton(false);
        toast("结果图生成失败，请重试", "error", { key: "share-generation-failed" });
      });
    } catch (error) {
      shareResult = null;
      dom.sharePreview.innerHTML = "<span>生成失败，请稍后再试</span>";
      updateShareSaveButton(false);
      toast("结果图生成失败，请重试", "error", { key: "share-generation-failed" });
    }
  }
