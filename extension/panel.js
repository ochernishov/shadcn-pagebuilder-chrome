import { DEFAULT_LOCALE, LOCALES, MESSAGES, translate } from "./i18n.js";

const TYPE_KEYS = ["hero", "navigation", "dashboard", "applicationShell", "dataTable", "logos", "features", "content", "steps", "cta", "pricing", "testimonials", "faq", "footer", "other"];
const $ = selector => document.querySelector(selector);
const state = { spec: null, pending: null, locale: DEFAULT_LOCALE, workspace: null };
const t = key => translate(state.locale, key);
const safeFileName = value => String(value || "block").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "block";

function defaultSpec() {
  return { id: crypto.randomUUID(), version: 2, project: APP_CONFIG.defaultProject, page: APP_CONFIG.defaultPage, route: APP_CONFIG.defaultRoute, framework: "Next.js", ui: "shadcn/ui", blocks: [] };
}

function defaultWorkspace(spec) { return { version: 1, activeSpecId: spec.id, specs: [spec] }; }

function inferTypeKey(capture) {
  const value = `${capture?.slug || ""} ${capture?.title || ""}`.toLowerCase();
  const rules = [
    ["application-shell", "applicationShell"], ["dashboard", "dashboard"], ["data-table", "dataTable"],
    ["navbar", "navigation"], ["navigation", "navigation"], ["hero", "hero"], ["logo", "logos"],
    ["feature", "features"], ["pricing", "pricing"], ["testimonial", "testimonials"], ["review", "testimonials"],
    ["faq", "faq"], ["footer", "footer"], ["cta", "cta"], ["step", "steps"], ["content", "content"]
  ];
  return rules.find(([needle]) => value.includes(needle))?.[1] || "other";
}

function normalizeTypeKey(block) {
  if (TYPE_KEYS.includes(block.typeKey)) return block.typeKey;
  for (const messages of Object.values(MESSAGES)) {
    const match = Object.entries(messages.types).find(([, label]) => label === block.type);
    if (match) return match[0];
  }
  return inferTypeKey(block);
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.title = APP_CONFIG.appName;
  document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-title]").forEach(element => { element.title = t(element.dataset.i18nTitle); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  $("#app-title").textContent = APP_CONFIG.appName;
}

function renderTypeOptions(selectedKey) {
  $("#block-type").replaceChildren(...TYPE_KEYS.map(key => Object.assign(document.createElement("option"), {
    value: key,
    textContent: MESSAGES[state.locale].types[key],
    selected: key === selectedKey
  })));
}

function renderLanguageSwitcher() {
  $("#language-switcher").replaceChildren(...LOCALES.map(locale => {
    const button = Object.assign(document.createElement("button"), { type: "button", textContent: locale.label, title: locale.name });
    button.setAttribute("aria-current", String(locale.id === state.locale));
    button.onclick = () => setLocale(locale.id);
    return button;
  }));
}

async function setLocale(locale) {
  if (!MESSAGES[locale]) return;
  state.locale = locale;
  await chrome.storage.local.set({ locale });
  await chrome.runtime.sendMessage({ type: "set-locale", locale });
  render();
}

async function hydrate() {
  const stored = await chrome.storage.local.get(["pageSpec", "workspace", "pendingCapture", "locale"]);
  state.locale = MESSAGES[stored.locale] ? stored.locale : DEFAULT_LOCALE;
  const legacySpec = stored.pageSpec || defaultSpec();
  if (!legacySpec.id) legacySpec.id = crypto.randomUUID();
  state.workspace = stored.workspace?.specs?.length ? stored.workspace : defaultWorkspace(legacySpec);
  state.spec = state.workspace.specs.find(spec => spec.id === state.workspace.activeSpecId) || state.workspace.specs[0];
  state.spec.version = 2;
  state.spec.blocks = state.spec.blocks.map(block => ({ ...block, typeKey: normalizeTypeKey(block) }));
  state.pending = stored.pendingCapture || null;
  render();
  await chrome.runtime.sendMessage({ type: "panel-ready" });
  await chrome.runtime.sendMessage({ type: "set-locale", locale: state.locale });
  if (!state.pending) {
    const response = await chrome.runtime.sendMessage({ type: "capture-active" });
    if (!response?.ok) status(`${t("captureFailed")}: ${response?.error || t("unknownError")}`);
  }
}

function markdown(spec) {
  const messages = MESSAGES[state.locale];
  const sections = spec.blocks.map((block, index) => {
    const screenshotPath = block.screenshotId ? `references/${String(index + 1).padStart(2, "0")}-${safeFileName(block.slug)}.png` : null;
    const reference = screenshotPath ? `\n\n${t("visualReference")}: \`${screenshotPath}\`` : "";
    return `## ${String(index + 1).padStart(2, "0")} — ${messages.types[normalizeTypeKey(block)]}\n\n${t("source")}: ${block.url}${reference}\n\nRegistry: \`${block.registry}\`\n\n${t("install")}: \`${block.installCommand}\`\n\n${t("changes")}:\n${block.instructions || t("fallbackChange")}`;
  }).join("\n\n---\n\n");
  const steps = t("agentSteps").map((step, index) => `${index + 1}. ${step}`).join("\n");
  return `# ${t("specTitle")}\n\n${t("project")}: ${spec.project}\n${t("page")}: ${spec.page}\n${t("targetRoute")}: ${spec.route}\n${t("framework")}: ${spec.framework}\nUI: ${spec.ui}\n${t("sourceLibrary")}: Shadcn Blocks\n\n## ${t("generalInstructions")}\n\n${t("generalText")}\n\n---\n\n${sections}\n\n## ${t("agentInstructions")}\n\n${steps}\n`;
}

async function persist() {
  const index = state.workspace.specs.findIndex(spec => spec.id === state.spec.id);
  if (index >= 0) state.workspace.specs[index] = state.spec;
  else state.workspace.specs.push(state.spec);
  state.workspace.activeSpecId = state.spec.id;
  await chrome.storage.local.set({ pageSpec: state.spec, workspace: state.workspace });
  render();
}

function renderWorkspace() {
  $("#saved-pages").replaceChildren(...state.workspace.specs.map(spec => Object.assign(document.createElement("option"), {
    value: spec.id,
    textContent: `${spec.project} / ${spec.page}`,
    selected: spec.id === state.spec.id
  })));
}

async function createSpec(project, page) {
  const spec = { ...defaultSpec(), project, page };
  state.workspace.specs.push(spec);
  state.spec = spec;
  await persist();
}

function render() {
  applyTranslations();
  renderLanguageSwitcher();
  renderWorkspace();
  $("#project").value = state.spec.project;
  $("#page").value = state.spec.page;
  $("#route").value = state.spec.route;
  $("#page-title").textContent = state.spec.page;
  $("#count").textContent = state.spec.blocks.length;
  $("#empty").hidden = state.spec.blocks.length > 0;
  $("#blocks").replaceChildren(...state.spec.blocks.map((block, index) => {
    const li = document.createElement("li");
    li.className = "block";
    li.innerHTML = `<span class="block-order">${String(index + 1).padStart(2, "0")}</span><div class="block-copy"><strong></strong><small></small></div><button type="button">↑</button><button type="button">↓</button><button type="button">×</button>`;
    li.querySelector("strong").textContent = MESSAGES[state.locale].types[normalizeTypeKey(block)];
    li.querySelector("small").textContent = `${block.slug}${block.screenshotId ? " · 📷" : ""}`;
    const buttons = li.querySelectorAll("button");
    [[buttons[0], "moveUp"], [buttons[1], "moveDown"], [buttons[2], "removeBlock"]].forEach(([button, key]) => { button.title = t(key); button.setAttribute("aria-label", t(key)); });
    buttons[0].onclick = () => move(index, -1);
    buttons[1].onclick = () => move(index, 1);
    buttons[2].onclick = () => remove(index);
    return li;
  }));
  $("#capture").hidden = !state.pending;
  const selectedType = state.pending && $("#block-type").dataset.captureId === state.pending.id ? $("#block-type").value : inferTypeKey(state.pending);
  renderTypeOptions(selectedType);
  if (state.pending) {
    $("#capture-title").textContent = state.pending.title;
    $("#capture-registry").textContent = state.pending.registry;
    $("#position").value = state.spec.blocks.length + 1;
    if ($("#block-type").dataset.captureId !== state.pending.id) {
      $("#instructions").value = state.pending.selectionText || "";
      $("#block-type").dataset.captureId = state.pending.id;
    }
  }
}

async function move(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= state.spec.blocks.length) return;
  [state.spec.blocks[index], state.spec.blocks[target]] = [state.spec.blocks[target], state.spec.blocks[index]];
  await persist();
}

async function remove(index) {
  const [block] = state.spec.blocks.splice(index, 1);
  if (block?.screenshotId) {
    const { screenshots = {} } = await chrome.storage.local.get("screenshots");
    delete screenshots[block.screenshotId];
    await chrome.storage.local.set({ screenshots });
  }
  await persist();
}
function status(text) { $("#status").textContent = text; setTimeout(() => $("#status").textContent = "", 3500); }

async function discardPending() {
  const button = $("#discard");
  button.disabled = true;
  state.pending = null;
  $("#capture").hidden = true;
  delete $("#block-type").dataset.captureId;
  try {
    await chrome.storage.local.remove("pendingCapture");
    status(t("blockDiscarded"));
  } catch (error) {
    status(`${t("discardFailed")}: ${error.message}`);
  } finally {
    button.disabled = false;
    render();
  }
}

$("#settings-toggle").onclick = () => $("#settings").hidden = !$("#settings").hidden;
$("#saved-pages").onchange = async event => {
  const next = state.workspace.specs.find(spec => spec.id === event.target.value);
  if (!next) return;
  state.spec = next;
  await persist();
};
$("#new-project").onclick = async () => {
  const project = prompt(t("projectNamePrompt"), "");
  if (project?.trim()) await createSpec(project.trim(), APP_CONFIG.defaultPage);
};
$("#new-page").onclick = async () => {
  const page = prompt(t("pageNamePrompt"), "");
  if (page?.trim()) await createSpec(state.spec.project, page.trim());
};
for (const field of ["project", "page", "route"]) $("#" + field).onchange = async event => { state.spec[field] = event.target.value.trim(); await persist(); };
$("#discard").addEventListener("click", discardPending);
$("#add").onclick = async () => {
  const addButton = $("#add");
  addButton.disabled = true;
  try {
    let screenshotDataUrl = null;
    if ($("#include-screenshot").checked) {
      const screenshot = await chrome.runtime.sendMessage({ type: "capture-screenshot" });
      if (screenshot?.ok) screenshotDataUrl = screenshot.dataUrl;
      else status(`${t("screenshotFailed")}: ${screenshot?.error || t("unknownError")}`);
    }
    const position = Math.max(0, Math.min(state.spec.blocks.length, Number($("#position").value) - 1));
    const block = { ...state.pending, typeKey: $("#block-type").value, instructions: $("#instructions").value.trim() };
    if (screenshotDataUrl) {
      block.screenshotId = block.id;
      block.screenshotPath = `references/${String(position + 1).padStart(2, "0")}-${safeFileName(block.slug)}.png`;
      const { screenshots = {} } = await chrome.storage.local.get("screenshots");
      screenshots[block.screenshotId] = screenshotDataUrl;
      await chrome.storage.local.set({ screenshots });
    }
    state.spec.blocks.splice(position, 0, block);
    state.pending = null;
    await chrome.storage.local.remove("pendingCapture");
    await persist();
    status(t("blockAdded"));
  } catch (error) {
    status(`${t("captureFailed")}: ${error.message}`);
  } finally {
    addButton.disabled = false;
  }
};
$("#copy").onclick = async () => { await navigator.clipboard.writeText(markdown(state.spec)); status(t("promptCopied")); };
$("#export").onclick = async () => {
  const { screenshots = {} } = await chrome.storage.local.get("screenshots");
  const response = await chrome.runtime.sendMessage({ type: "native", payload: { action: "export", spec: state.spec, markdown: markdown(state.spec), screenshots } });
  status(response?.ok ? `${t("saved")}: ${response.directory}` : `${t("exportFailed")}: ${response?.error || t("unknownError")}`);
};
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.pendingCapture) {
    state.pending = changes.pendingCapture.newValue || null;
    render();
  }
});
hydrate();
