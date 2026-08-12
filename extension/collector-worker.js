import "./config.js";

const MENU_ID = "page-collector-add";
const MENU_TITLES = {
  en: "Add to Shadcn Page Collector",
  ru: "Добавить в Коллектор блоков",
  fr: "Ajouter au collecteur de blocs",
  it: "Aggiungi al raccoglitore di blocchi",
  zh: "添加到页面模块收集器"
};

function createContextMenu(locale = "en") {
  chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
    id: MENU_ID,
    title: MENU_TITLES[locale] || MENU_TITLES.en,
    contexts: ["page", "selection", "link", "image"],
    documentUrlPatterns: [globalThis.APP_CONFIG.allowedHostPattern]
  }));
}

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.get("locale").then(({ locale }) => createContextMenu(locale));
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

async function capture(tab, selectionText = "") {
  if (!tab?.id || !tab.url) return;
  const url = new URL(tab.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const slug = pathParts.at(-1) || "block";
  await chrome.storage.local.set({ pendingCapture: {
    id: crypto.randomUUID(),
    kind: "source",
    title: tab.title || slug,
    url: tab.url,
    slug,
    sourceDomain: url.hostname.replace(/^www\./, ""),
    selectionText,
    capturedAt: new Date().toISOString()
  }});
}

function selectPageRegion(labels) {
  return new Promise(resolve => {
    const root = document.createElement("div");
    root.dataset.pageCollectorSelector = "";
    const shadow = root.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; --pc-accent: #ff5c35; --pc-ink: #17201b; --pc-paper: #fbfaf6; --pc-space: clamp(.65rem, 1.5vw, 1rem); }
      .veil { position: fixed; inset: 0; z-index: 2147483647; cursor: crosshair; background: rgb(23 32 27 / .24); user-select: none; touch-action: none; }
      .hint { position: fixed; inset-block-start: var(--pc-space); inset-inline-start: 50%; translate: -50% 0; max-inline-size: min(90vw, 42rem); padding: calc(var(--pc-space) * .72) var(--pc-space); border-radius: calc(var(--pc-space) * .7); background: var(--pc-ink); color: var(--pc-paper); font: 650 clamp(.82rem, 1.4vw, 1rem)/1.35 -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; box-shadow: 0 calc(var(--pc-space) * .6) calc(var(--pc-space) * 1.8) rgb(23 32 27 / .28); }
      .selection { position: fixed; display: none; border: calc(var(--pc-space) * .12) solid var(--pc-accent); background: rgb(255 92 53 / .08); box-shadow: 0 0 0 100vmax rgb(23 32 27 / .42); }
      .cancel { position: fixed; inset-block-end: var(--pc-space); inset-inline-start: 50%; translate: -50% 0; color: var(--pc-paper); font: 600 clamp(.72rem, 1.2vw, .9rem)/1.35 -apple-system, BlinkMacSystemFont, sans-serif; }
    `;
    const veil = document.createElement("div");
    veil.className = "veil";
    veil.innerHTML = `<div class="hint"></div><div class="selection"></div><div class="cancel"></div>`;
    veil.querySelector(".hint").textContent = labels.hint;
    veil.querySelector(".cancel").textContent = labels.cancel;
    shadow.append(style, veil);
    document.documentElement.append(root);

    const selection = veil.querySelector(".selection");
    let start = null;
    const finish = value => {
      root.remove();
      document.removeEventListener("keydown", onKeyDown, true);
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(value)));
    };
    const update = point => {
      const left = Math.min(start.x, point.x);
      const top = Math.min(start.y, point.y);
      const width = Math.abs(point.x - start.x);
      const height = Math.abs(point.y - start.y);
      Object.assign(selection.style, {
        display: "block",
        insetInlineStart: `${left}px`,
        insetBlockStart: `${top}px`,
        inlineSize: `${width}px`,
        blockSize: `${height}px`
      });
      return { left, top, width, height };
    };
    const onKeyDown = event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      finish(null);
    };
    document.addEventListener("keydown", onKeyDown, true);
    veil.addEventListener("pointerdown", event => {
      event.preventDefault();
      start = { x: event.clientX, y: event.clientY };
      veil.setPointerCapture(event.pointerId);
      update(start);
    });
    veil.addEventListener("pointermove", event => {
      if (!start) return;
      update({ x: event.clientX, y: event.clientY });
    });
    veil.addEventListener("pointerup", event => {
      if (!start) return;
      const rect = update({ x: event.clientX, y: event.clientY });
      start = null;
      if (rect.width < 8 || rect.height < 8) return finish(null);
      finish({ rect, viewport: { width: window.innerWidth, height: window.innerHeight } });
    });
  });
}

async function captureSelectedRegion(labels) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) throw new Error("No active web page");
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: selectPageRegion,
    args: [labels]
  });
  const result = results[0]?.result;
  if (!result?.rect) return { ok: false, canceled: true };
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
  return {
    ok: true,
    dataUrl,
    rect: result.rect,
    viewport: result.viewport,
    page: {
      title: tab.title || new URL(tab.url).hostname,
      url: tab.url,
      sourceDomain: new URL(tab.url).hostname.replace(/^www\./, "")
    }
  };
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) {
    void capture(tab, info.selectionText || "")
      .then(() => chrome.action.setBadgeText({ text: "1" }))
      .then(() => chrome.action.setBadgeBackgroundColor({ color: "#ff5c35" }))
      .catch(error => console.error("Не удалось добавить блок:", error));
  }
});

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message.type === "capture-selected-region") {
    captureSelectedRegion(message.labels)
      .then(respond)
      .catch(error => respond({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === "capture-screenshot") {
    chrome.tabs.captureVisibleTab(undefined, { format: "png" })
      .then(dataUrl => respond({ ok: true, dataUrl }))
      .catch(error => respond({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === "set-locale") {
    createContextMenu(message.locale);
    respond({ ok: true });
    return false;
  }
  if (message.type === "panel-ready") {
    chrome.action.setBadgeText({ text: "" })
      .then(() => respond({ ok: true }))
      .catch(error => respond({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === "capture-active") {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(([tab]) => capture(tab))
      .then(() => respond({ ok: true }))
      .catch(error => respond({ ok: false, error: error.message }));
    return true;
  }
  if (message.type !== "native") return false;
  chrome.runtime.sendNativeMessage(globalThis.APP_CONFIG.nativeHostName, message.payload)
    .then(respond)
    .catch(error => respond({ ok: false, error: error.message }));
  return true;
});
