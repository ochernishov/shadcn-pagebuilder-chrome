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
    contexts: ["page", "selection", "link"],
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
  const registry = `@shadcnblocks/${slug}`;
  await chrome.storage.local.set({ pendingCapture: {
    id: crypto.randomUUID(),
    title: tab.title || slug,
    url: tab.url,
    slug,
    registry,
    installCommand: `npx shadcn@latest add ${registry}`,
    selectionText,
    capturedAt: new Date().toISOString()
  }});
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
