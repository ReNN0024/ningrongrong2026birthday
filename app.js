(() => {
  "use strict";

  const STORAGE_KEY = "ningrongrong-2026-coordinate-v1";
  const STORAGE_TTL = 30 * 24 * 60 * 60 * 1000;
  const ACTIVITY_ID = "ningrongrong-2026-birthday";
  const ASSET_ROOT = window.__ASSET_ROOT__ || "assets";
  const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;
  const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const placeholderColors = ["#caa7a2", "#cdbb83", "#9bb9bd", "#aabe91", "#c494aa", "#b7a58e", "#d5aa7c"];
  const officialNames = ["远航", "夜", "心跳", "醇香", "代言", "心意", "昏晓", "幻蝶", "晨曦"];
  const slotForIndex = index => `${Math.floor(index / 4) + 1}_${index % 4 + 1}`;
  const logos = Array.from({ length: 41 }, (_, index) => {
    const slot = slotForIndex(index);
    return {
      id: slot,
      slot,
      name: officialNames[index] || slot,
      src: `${ASSET_ROOT}/logos/${slot}.webp`,
      detail: `${ASSET_ROOT}/detail-images/${slot}.webp`,
      color: placeholderColors[index % placeholderColors.length],
      placeholder: index >= officialNames.length
    };
  });
  const logoMap = new Map(logos.map(item => [item.id, item]));
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
    grid: $("#logoGrid"), scroll: $("#logoScroll"), library: $("#libraryPanel"), libraryHead: $("#libraryHead"),
    returnTarget: $("#returnTarget"), immersiveReturn: $("#immersiveReturn"), ghost: $("#dragGhost"),
    toolbar: $("#coordinateToolbar"), toolbarHandle: $("#toolbarHandle"), zoomValue: $("#zoomValue"),
    minimap: $("#viewportMinimap"), minimapViewport: $("#minimapViewport"),
    guideLineX: $("#guideLineX"), guideLineY: $("#guideLineY"), preview: $("#previewPopover"), previewMedia: $("#previewMedia"),
    toastStack: $("#toastStack"), live: $("#liveRegion"), empty: $("#emptyState"),
    clearDialog: $("#clearDialog"), undo: $("#undoBtn"), redo: $("#redoBtn"), clear: $("#clearBtn")
  };

  const state = {
    placed: [], selectedId: null, filter: "all", guides: false,
    view: { scale: 1, panX: 0, panY: 0 }, toolbar: { x: 20, y: 8 },
    undo: [], redo: [], previewId: null, immersive: false
  };
  let saveTimer = 0;
  let press = null;
  let drag = null;
  let hoverTimer = 0;
  let previewHideTimer = 0;
  let toolbarDrag = null;
  let minimapDrag = null;
  let listMomentumFrame = 0;
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

  function applyLibraryTouchMode() {
    const mobile = isMobile();
    dom.grid.querySelectorAll(".logo-card").forEach(card => {
      card.style.touchAction = mobile ? "none" : "pan-y";
      card.style.webkitTouchCallout = mobile ? "none" : "";
    });
  }

  function mediaMarkup(logo, className = "", lazy = false) {
    if (logo.src) return `<img class="${className}" src="${logo.src}" alt="" draggable="false"${lazy ? ' loading="lazy"' : ""}>`;
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
    if (message) toast(message);
  }

  function renderAll() {
    renderLibrary();
    renderPlaced();
    updateCounts();
    updateHistoryButtons();
    updateGuides();
  }

  function renderLibrary() {
    const placedIds = new Set(state.placed.map(item => item.id));
    const visible = logos.filter(item => state.filter === "all" || !placedIds.has(item.id));
    dom.grid.innerHTML = visible.map((logo, index) => {
      const placed = placedIds.has(logo.id);
      const sequence = String(logos.indexOf(logo) + 1).padStart(2, "0");
      const label = logo.placeholder ? `占位 Logo ${sequence}` : logo.name;
      return `<button class="logo-card${placed ? " is-placed" : ""}${state.selectedId === logo.id ? " is-focused" : ""}" type="button" data-logo-id="${logo.id}" aria-label="${placed ? "定位已放置" : "放置"}${escapeHTML(label)}" aria-pressed="${state.selectedId === logo.id}">
        <span class="logo-thumb">${mediaMarkup(logo, "", true)}</span><span>${escapeHTML(logo.name)}</span>
      </button>`;
    }).join("");
    applyLibraryTouchMode();
    dom.empty.hidden = visible.length > 0;
  }

  function renderPlaced() {
    dom.placedLayer.innerHTML = [...state.placed].sort((a, b) => a.z - b.z).map(item => {
      const logo = logoMap.get(item.id);
      return `<button class="placed-logo${state.selectedId === item.id ? " is-selected" : ""}" type="button" data-logo-id="${item.id}" style="z-index:${item.z}" aria-label="${escapeHTML(logo.name)}，已放置在坐标 ${item.x.toFixed(2)}, ${item.y.toFixed(2)}">${mediaMarkup(logo)}</button>`;
    }).join("");
    updatePlacedLayout();
  }

  function getBaseLogoSize(frameSize) {
    if (isMobile()) {
      return Math.min(54, Math.max(40, window.innerWidth * 0.13));
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
    });
  }

  function updateCounts() {
    const placed = state.placed.length;
    $$('[data-total]').forEach(el => { el.textContent = String(logos.length); });
    $("#placedCountDesktop").textContent = String(placed).padStart(2, "0");
    $("#placedCountMobile").textContent = String(placed).padStart(2, "0");
    $("#unplacedCount").textContent = String(logos.length - placed);
    dom.clear.disabled = placed === 0;
  }

  function updateHistoryButtons() {
    dom.undo.disabled = state.undo.length === 0;
    dom.redo.disabled = state.redo.length === 0;
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
    }, `${logoMap.get(id).name} 已放到坐标原点`);
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
    toast(`已定位 ${logoMap.get(id).name}`);
  }

  function removePlaced(id) {
    mutatePlaced(() => {
      state.placed = state.placed.filter(item => item.id !== id);
      if (state.selectedId === id) state.selectedId = null;
    }, `${logoMap.get(id).name} 已放回待选区`);
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
    }, isNew ? `${logoMap.get(id).name} 放置成功` : "");
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
      toast("此处已有碎片，已将当前 Logo 置于上层");
    });
  }

  function undo() {
    if (!state.undo.length) return;
    state.redo.push(clonePlaced());
    state.placed = state.undo.pop();
    if (!state.placed.some(item => item.id === state.selectedId)) state.selectedId = null;
    renderAll(); scheduleSave(); closePreview(); toast("已撤销上一步");
  }

  function redo() {
    if (!state.redo.length) return;
    state.undo.push(clonePlaced());
    state.placed = state.redo.pop();
    renderAll(); scheduleSave(); closePreview(); toast("已重做下一步");
  }

  function clearAll() {
    if (!state.placed.length) return;
    mutatePlaced(() => { state.placed = []; state.selectedId = null; }, "已清空，可撤销恢复");
    closePreview();
  }

  function updateGuides() {
    dom.world.classList.toggle("guides-on", state.guides);
    $("#guideBtn").setAttribute("aria-pressed", String(state.guides));
    const selected = state.placed.find(item => item.id === state.selectedId);
    const x = selected ? 50 + selected.x * 42 : 50;
    const y = selected ? 50 - selected.y * 42 : 50;
    dom.guideLineY.style.left = `${x}%`;
    dom.guideLineX.style.top = `${y}%`;
  }

  function toast(message, type = "") {
    const el = document.createElement("div");
    el.className = `toast${type ? ` is-${type}` : ""}`;
    el.textContent = message;
    dom.toastStack.append(el);
    window.setTimeout(() => el.remove(), 2200);
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
    applyView(); scheduleSave(); toast("已回到初始视角");
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
    closePreview();
    const logo = logoMap.get(id);
    dom.ghost.innerHTML = mediaMarkup(logo);
    dom.ghost.classList.add("is-active");
    updateDrag(event.clientX, event.clientY);
    if (source === "placed") {
      dom.library.classList.add("is-returning");
      document.body.classList.add("is-dragging-placed");
    }
    navigator.vibrate?.(12);
  }

  function updateDrag(x, y) {
    if (!drag) return;
    drag.x = x; drag.y = y;
    dom.ghost.style.left = `${x}px`;
    dom.ghost.style.top = `${y - 18}px`;
    const frameRect = dom.frame.getBoundingClientRect();
    const inFrame = isPointInRect(x, y, frameRect);
    dom.frame.classList.toggle("is-drop-valid", inFrame);
    const targetRect = dom.libraryHead.getBoundingClientRect();
    const inReturn = drag.source === "placed" && isPointInRect(x, y, targetRect);
    dom.returnTarget.classList.toggle("is-over", inReturn);
    dom.immersiveReturn.classList.toggle("is-over", inReturn);
  }

  function finishDrag(event, cancelled = false) {
    if (!drag) return;
    const current = drag;
    const frameRect = dom.frame.getBoundingClientRect();
    const returnRect = dom.libraryHead.getBoundingClientRect();
    const inFrame = isPointInRect(event.clientX, event.clientY, frameRect);
    const inReturn = current.source === "placed" && isPointInRect(event.clientX, event.clientY, returnRect);
    cleanupDrag();
    if (cancelled) { toast("操作已取消"); return; }
    if (inReturn) { removePlaced(current.id); return; }
    if (inFrame) {
      movePlaced(current.id, pointToLogical(event.clientX, event.clientY), current.source === "library");
      return;
    }
    dom.frame.classList.add("is-drop-invalid");
    window.setTimeout(() => dom.frame.classList.remove("is-drop-invalid"), 420);
    toast(current.source === "placed" ? "未进入有效区域，已回到原位置" : "请将 Logo 放入坐标区域", "error");
  }

  function cleanupDrag() {
    drag?.sourceElement?.classList.remove("is-holding", "is-drag-ready");
    dom.ghost.classList.remove("is-active");
    dom.ghost.innerHTML = "";
    dom.frame.classList.remove("is-drop-valid");
    dom.library.classList.remove("is-returning");
    dom.returnTarget.classList.remove("is-over");
    dom.immersiveReturn.classList.remove("is-over");
    document.body.classList.remove("is-dragging-placed");
    drag = null;
  }

  function handleLogoPointerDown(event, source) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const button = event.target.closest(source === "library" ? ".logo-card" : ".placed-logo");
    if (!button) return;
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
      renderLibrary();
      dom.placedLayer.querySelectorAll(".placed-logo").forEach(el => el.classList.toggle("is-selected", el.dataset.logoId === id));
      updateGuides();
      scheduleSave();
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
          announce("\u5DF2\u62FE\u53D6 Logo\uFF0C\u53EF\u4EE5\u62D6\u52A8\u653E\u7F6E");
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
      toolbarDrag = null; scheduleSave(); return;
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
      openPreview(current.id, event.currentTarget || event.target);
    }
  }

  function onGlobalPointerCancel(event) {
    clearTimeout(press?.timer);
    press?.element?.classList.remove("is-holding", "is-drag-ready");
    if (drag?.pointerId === event.pointerId) finishDrag(event, true);
    if (press?.pointerId === event.pointerId) press = null;
    if (toolbarDrag?.pointerId === event.pointerId) toolbarDrag = null;
  }

  function openPreview(id, anchor) {
    const logo = logoMap.get(id);
    if (!logo) return;
    state.previewId = id;
    dom.previewMedia.innerHTML = logo.detail
      ? `<img src="${logo.detail}" alt="${escapeHTML(logo.name)}大图">`
      : `<div class="preview-placeholder" style="background:${logo.color}"></div>`;
    dom.preview.hidden = false;
    const anchorEl = anchor?.closest?.(".placed-logo") || dom.placedLayer.querySelector(`[data-logo-id="${id}"]`);
    const previewImage = dom.previewMedia.querySelector("img");
    const showPreview = () => {
      requestAnimationFrame(() => {
        positionPreview(anchorEl);
        dom.preview.classList.add("is-visible");
      });
    };
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

  function closePreview() {
    clearTimeout(hoverTimer); clearTimeout(previewHideTimer);
    dom.preview.classList.remove("is-visible");
    state.previewId = null;
    window.setTimeout(() => { if (!state.previewId) dom.preview.hidden = true; }, 160);
  }

  function handlePlacedHover(event) {
    if (isMobile() || event.pointerType === "touch") return;
    const target = event.target.closest(".placed-logo");
    if (!target) return;
    clearTimeout(hoverTimer);
    clearTimeout(previewHideTimer);
    hoverTimer = window.setTimeout(() => openPreview(target.dataset.logoId, target), 250);
  }

  function handlePlacedLeave(event) {
    if (isMobile()) return;
    const target = event.target.closest(".placed-logo");
    if (!target || target.contains(event.relatedTarget)) return;
    clearTimeout(hoverTimer);
    previewHideTimer = window.setTimeout(closePreview, 80);
  }

  function startStageGesture(event) {
    if (event.target.closest(".placed-logo, .coordinate-toolbar")) return;
    dom.frame.setPointerCapture?.(event.pointerId);
    stagePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (stagePointers.size === 1) {
      stageGesture = { type: "pan", startX: event.clientX, startY: event.clientY, panX: state.view.panX, panY: state.view.panY, moved: false };
      dom.frame.classList.add("is-panning");
    } else if (stagePointers.size === 2) {
      const pts = [...stagePointers.values()];
      stageGesture = { type: "pinch", distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), scale: state.view.scale, panX: state.view.panX, panY: state.view.panY, centerX: (pts[0].x + pts[1].x) / 2, centerY: (pts[0].y + pts[1].y) / 2 };
    }
    if (isMobile() && state.previewId) closePreview();
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
        renderLibrary();
        renderPlaced();
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
    toast(native ? "已进入全屏" : "当前浏览器使用沉浸模式");
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
      const item = event.target.closest(".placed-logo");
      if (!item) return;
      selectLogo(item.dataset.logoId);
      openPreview(item.dataset.logoId, item);
    });
    dom.placedLayer.addEventListener("pointerover", handlePlacedHover);
    dom.placedLayer.addEventListener("pointerout", handlePlacedLeave);
    dom.placedLayer.addEventListener("focusin", event => {
      const el = event.target.closest(".placed-logo"); if (el && !isMobile()) openPreview(el.dataset.logoId, el);
    });
    dom.placedLayer.addEventListener("focusout", event => { if (!isMobile() && !event.relatedTarget?.closest?.(".preview-popover")) closePreview(); });
    document.addEventListener("pointermove", onGlobalPointerMove, { passive: false });
    document.addEventListener("pointerup", onGlobalPointerUp);
    document.addEventListener("pointercancel", onGlobalPointerCancel);
    document.addEventListener("pointerdown", event => {
      if (isMobile() && state.previewId && !event.target.closest(".placed-logo, .preview-popover")) closePreview();
    }, true);

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
    $("#guideBtn").addEventListener("click", () => { state.guides = !state.guides; updateGuides(); scheduleSave(); toast(state.guides ? "辅助线已显示" : "辅助线已隐藏"); });
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
      if (event.key === STORAGE_KEY && event.newValue) toast("另一页面已更新本地进度，刷新后可载入");
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
      if (restored) toast("已恢复你上次的放置进度");
    });
  }

  init();
})();
