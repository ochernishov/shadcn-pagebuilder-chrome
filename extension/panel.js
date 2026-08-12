import { DEFAULT_LOCALE, LOCALES, MESSAGES, localizeSystemLabels, migrateSystemLabels, translate } from "./i18n.js";

const TYPE_KEYS = ["hero", "navigation", "dashboard", "applicationShell", "dataTable", "logos", "features", "content", "steps", "cta", "pricing", "testimonials", "faq", "footer", "other"];
const $ = selector => document.querySelector(selector);
const state = { spec: null, pending: null, locale: DEFAULT_LOCALE, workspace: null, expandedBlockId: null, screenshots: {}, settingsExpanded: true, workflowMode: "page", workflowDrafts: { page: null, single: null }, singleItem: null };
let folderPickerOpen = false;
const t = key => translate(state.locale, key);
const safeFileName = value => String(value || "block").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "block";

function defaultSpec() {
  return { id: crypto.randomUUID(), version: 4, project: t("defaultProjectName"), projectLabelKey: "defaultProjectName", projectDirectory: "", page: t("defaultPageName"), pageLabelKey: "defaultPageName", pageMode: "create", route: APP_CONFIG.defaultRoute, framework: "Next.js", ui: "shadcn/ui", blocks: [] };
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
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => { element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)); });
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
  state.workspace.specs.forEach(spec => localizeSystemLabels(spec, locale));
  await chrome.storage.local.set({ locale, pageSpec: state.spec, workspace: state.workspace });
  await chrome.runtime.sendMessage({ type: "set-locale", locale });
  render();
}

async function hydrate() {
  const stored = await chrome.storage.local.get(["pageSpec", "workspace", "pendingCapture", "locale", "screenshots", "settingsExpanded", "workflowMode", "workflowDrafts", "singleItem"]);
  state.locale = MESSAGES[stored.locale] ? stored.locale : DEFAULT_LOCALE;
  const legacySpec = stored.pageSpec || defaultSpec();
  if (!legacySpec.id) legacySpec.id = crypto.randomUUID();
  state.workspace = stored.workspace?.specs?.length ? stored.workspace : defaultWorkspace(legacySpec);
  state.workspace.specs.forEach(spec => {
    spec.projectDirectory ||= "";
    spec.pageMode ||= "create";
    spec.version = 4;
    spec.blocks = (spec.blocks || []).map(block => ({ ...block, kind: block.kind || "source", typeKey: normalizeTypeKey(block) }));
    migrateSystemLabels(spec, state.locale, { project: APP_CONFIG.defaultProject, page: APP_CONFIG.defaultPage });
  });
  state.spec = state.workspace.specs.find(spec => spec.id === state.workspace.activeSpecId) || state.workspace.specs[0];
  state.settingsExpanded = typeof stored.settingsExpanded === "boolean" ? stored.settingsExpanded : !state.spec.projectDirectory;
  state.workflowMode = stored.workflowMode === "single" ? "single" : "page";
  state.workflowDrafts = { page: null, single: null, ...stored.workflowDrafts };
  state.singleItem = stored.singleItem || null;
  state.screenshots = stored.screenshots || {};
  state.pending = stored.pendingCapture || state.workflowDrafts[state.workflowMode] || null;
  state.workflowDrafts[state.workflowMode] = state.pending;
  const existing = state.workflowMode === "page" && state.pending && state.spec.blocks.find(block => block.kind !== "visual-reference" && block.url === state.pending.url);
  if (existing) {
    state.expandedBlockId = existing.id;
    state.pending = null;
    state.workflowDrafts.page = null;
    await chrome.storage.local.remove("pendingCapture");
    await chrome.storage.local.set({ workflowDrafts: state.workflowDrafts });
  }
  render();
  if (existing) status(t("alreadyAdded"));
  await chrome.runtime.sendMessage({ type: "panel-ready" });
  await chrome.runtime.sendMessage({ type: "set-locale", locale: state.locale });
}

function markdown(spec) {
  const messages = MESSAGES[state.locale];
  const sections = spec.blocks.map((block, index) => {
    const screenshotPath = block.screenshotId ? `references/${String(index + 1).padStart(2, "0")}-${safeFileName(block.slug)}.png` : null;
    const reference = screenshotPath ? `\n\n${t("visualReference")}: \`${screenshotPath}\`` : "";
    const heading = block.kind === "visual-reference" ? t("visualReferenceItem") : messages.types[normalizeTypeKey(block)];
    const registry = block.registry ? `\n\n${t("registryLabel")}: \`${block.registry}\`` : "";
    const install = block.installCommand ? `\n\n${t("install")}: \`${block.installCommand}\`` : "";
    const selectedText = block.selectionText ? `\n\n${t("capturedText")}:\n> ${block.selectionText.replaceAll("\n", "\n> ")}` : "";
    const fallback = block.kind === "visual-reference" ? t("visualReferenceFallback") : t("fallbackChange");
    return `## ${String(index + 1).padStart(2, "0")} — ${heading}\n\n${t("source")}: ${block.url}${reference}${registry}${install}${selectedText}\n\n${t("changes")}:\n${block.instructions || fallback}`;
  }).join("\n\n---\n\n");
  const steps = t("agentSteps").map((step, index) => `${index + 1}. ${step}`).join("\n");
  const projectDirectory = spec.projectDirectory ? `\n${t("projectFolder")}: ${spec.projectDirectory}` : "";
  const pageMode = t(spec.pageMode === "edit" ? "editPage" : "createPage");
  return `# ${t("specTitle")}\n\n${t("project")}: ${spec.project}${projectDirectory}\n${t("page")}: ${spec.page}\n${t("pageMode")}: ${pageMode}\n${t("targetRoute")}: ${spec.route}\n${t("framework")}: ${spec.framework}\nUI: ${spec.ui}\n\n## ${t("generalInstructions")}\n\n${t("generalText")}\n\n---\n\n${sections}\n\n## ${t("agentInstructions")}\n\n${steps}\n`;
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

function renderPageMode() {
  $("#page-mode").replaceChildren(...["create", "edit"].map(value => Object.assign(document.createElement("option"), {
    value,
    textContent: t(value === "create" ? "createPage" : "editPage"),
    selected: state.spec.pageMode === value
  })));
}

function renderSettings() {
  const expanded = state.settingsExpanded;
  const mode = t(state.spec.pageMode === "edit" ? "editPage" : "createPage");
  $("#settings").setAttribute("aria-expanded", String(expanded));
  $("#settings-toggle").setAttribute("aria-expanded", String(expanded));
  $("#settings-toggle").setAttribute("aria-label", t(expanded ? "collapseProjectSettings" : "expandProjectSettings"));
  $("#settings-fields").hidden = !expanded;
  $("#settings-summary-title").textContent = `${state.spec.project} / ${state.spec.page}`;
  $("#settings-summary-meta").textContent = `${state.spec.route} · ${mode}`;
}

function renderWorkflow() {
  const single = state.workflowMode === "single";
  document.querySelectorAll(".page-workflow").forEach(element => { element.hidden = single; });
  $("#single-workspace").hidden = !single;
  $("#page-mode-tab").setAttribute("aria-selected", String(!single));
  $("#single-mode-tab").setAttribute("aria-selected", String(single));
  $("#page-mode-tab").tabIndex = single ? -1 : 0;
  $("#single-mode-tab").tabIndex = single ? 0 : -1;
  $("#app-eyebrow").textContent = t(single ? "singleDesignIntent" : "designIntent");
  $("#capture-position-field").hidden = single;
  $("#add").textContent = t(single ? "prepareSingle" : "addBlock");
  renderSingleItem();
}

function renderSingleItem() {
  const block = state.singleItem;
  $("#single-empty").hidden = Boolean(block || state.pending);
  $("#single-result").hidden = !block;
  if (!block) return;
  $("#single-title").textContent = block.title;
  $("#single-domain").textContent = block.sourceDomain || block.slug;
  $("#single-type").textContent = MESSAGES[state.locale].types[normalizeTypeKey(block)];
  $("#single-source").href = block.url;
  $("#single-source").textContent = `${block.url} ↗`;
  $("#single-notes-row").hidden = !block.instructions;
  $("#single-notes").textContent = block.instructions || "";
  const screenshot = block.screenshotId && state.screenshots[block.screenshotId];
  const previewSlot = $("#single-preview-slot");
  previewSlot.replaceChildren();
  if (screenshot) {
    const preview = document.createElement("img");
    preview.className = "block-preview";
    preview.src = screenshot;
    preview.alt = t("screenshotPreviewAlt");
    previewSlot.append(preview);
  }
}

async function setWorkflowMode(mode) {
  if (!["page", "single"].includes(mode) || mode === state.workflowMode) return;
  state.workflowDrafts[state.workflowMode] = state.pending;
  state.workflowMode = mode;
  state.pending = state.workflowDrafts[mode] || null;
  await chrome.storage.local.set({ workflowMode: mode, workflowDrafts: state.workflowDrafts });
  if (state.pending) await chrome.storage.local.set({ pendingCapture: state.pending });
  else await chrome.storage.local.remove("pendingCapture");
  render();
}

async function setSettingsExpanded(expanded) {
  state.settingsExpanded = expanded;
  await chrome.storage.local.set({ settingsExpanded: expanded });
  renderSettings();
}

async function createSpec(project, page, labelKeys = {}) {
  const spec = { ...defaultSpec(), project, page };
  if (labelKeys.projectLabelKey) spec.projectLabelKey = labelKeys.projectLabelKey;
  else delete spec.projectLabelKey;
  if (labelKeys.pageLabelKey) spec.pageLabelKey = labelKeys.pageLabelKey;
  else delete spec.pageLabelKey;
  state.workspace.specs.push(spec);
  state.spec = spec;
  await persist();
}

async function requestProjectFolder() {
  if (folderPickerOpen) return null;
  folderPickerOpen = true;
  const buttons = [$("#choose-folder"), $("#new-project")];
  buttons.forEach(button => { button.disabled = true; });
  try {
    const response = await chrome.runtime.sendMessage({ type: "native", payload: { action: "choose-directory", prompt: t("projectFolder") } });
    if (response?.ok) return response;
    if (!response?.canceled && !response?.busy) status(`${t("chooseFolderFailed")}: ${response?.error || t("unknownError")}`);
    return null;
  } finally {
    folderPickerOpen = false;
    buttons.forEach(button => { button.disabled = false; });
  }
}

async function chooseFolderForCurrentSpec() {
  const selected = await requestProjectFolder();
  if (!selected) return;
  state.spec.projectDirectory = selected.directory;
  state.spec.project = selected.name;
  delete state.spec.projectLabelKey;
  state.settingsExpanded = false;
  await chrome.storage.local.set({ settingsExpanded: false });
  await persist();
}

function render() {
  applyTranslations();
  renderLanguageSwitcher();
  renderWorkspace();
  renderPageMode();
  renderSettings();
  renderWorkflow();
  $("#project-folder").textContent = state.spec.projectDirectory || t("noFolder");
  $("#project-folder").title = state.spec.projectDirectory || t("noFolder");
  $("#page").value = state.spec.page;
  $("#route").value = state.spec.route;
  $("#page-title").textContent = state.spec.page;
  $("#empty").hidden = state.spec.blocks.length > 0;
  $("#blocks").replaceChildren(...state.spec.blocks.map((block, index) => {
    const li = document.createElement("li");
    li.className = "block";
    const expanded = state.expandedBlockId === block.id;
    li.setAttribute("aria-expanded", String(expanded));
    li.innerHTML = `<div class="block-summary"><span class="block-order">${String(index + 1).padStart(2, "0")}</span><div class="block-copy"><strong></strong><small></small></div><button type="button">↑</button><button type="button">↓</button><button type="button">×</button><button type="button" class="block-toggle">⌄</button></div><div class="block-details" ${expanded ? "" : "hidden"}><a target="_blank" rel="noreferrer"></a><span class="detail-registry"></span><code class="detail-install"></code><label class="detail-notes-editor"><span></span><textarea rows="4"></textarea></label><div class="detail-actions"><button type="button" class="save-notes"></button></div><span class="detail-screenshot"></span></div>`;
    li.querySelector("strong").textContent = block.kind === "visual-reference" ? t("visualReferenceItem") : MESSAGES[state.locale].types[normalizeTypeKey(block)];
    li.querySelector("small").textContent = `${block.sourceDomain || block.slug}${block.screenshotId ? " · 📷" : ""}`;
    const link = li.querySelector("a");
    link.href = block.url;
    link.textContent = `${t("openSource")} ↗`;
    const registry = li.querySelector(".detail-registry");
    registry.textContent = block.registry ? `${t("registryLabel")}: ${block.registry}` : "";
    registry.hidden = !block.registry;
    const install = li.querySelector(".detail-install");
    install.textContent = block.installCommand || "";
    install.hidden = !block.installCommand;
    const notesLabel = li.querySelector(".detail-notes-editor span");
    notesLabel.textContent = t("implementationNotes");
    const notes = li.querySelector(".detail-notes-editor textarea");
    notes.value = block.instructions || "";
    notes.placeholder = t("notesPlaceholder");
    const saveNotes = li.querySelector(".save-notes");
    saveNotes.textContent = t("saveNotes");
    saveNotes.onclick = event => {
      event.stopPropagation();
      void updateBlockInstructions(index, notes.value, saveNotes);
    };
    notes.onkeydown = event => {
      if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) return;
      event.preventDefault();
      void updateBlockInstructions(index, notes.value, saveNotes);
    };
    li.querySelector(".detail-screenshot").textContent = block.screenshotId ? `✓ ${t("screenshotIncluded")}` : "";
    if (block.screenshotId && state.screenshots[block.screenshotId]) {
      const preview = document.createElement("img");
      preview.className = "block-preview";
      preview.src = state.screenshots[block.screenshotId];
      preview.alt = t("screenshotPreviewAlt");
      li.querySelector(".block-details").append(preview);
    }
    const buttons = li.querySelector(".block-summary").querySelectorAll("button");
    [[buttons[0], "moveUp"], [buttons[1], "moveDown"], [buttons[2], "removeBlock"]].forEach(([button, key]) => { button.title = t(key); button.setAttribute("aria-label", t(key)); });
    buttons[0].onclick = event => { event.stopPropagation(); void move(index, -1); };
    buttons[1].onclick = event => { event.stopPropagation(); void move(index, 1); };
    buttons[2].onclick = event => { event.stopPropagation(); void remove(index); };
    const toggle = () => { state.expandedBlockId = expanded ? null : block.id; render(); };
    buttons[3].onclick = event => { event.stopPropagation(); toggle(); };
    li.querySelector(".block-summary").onclick = toggle;
    return li;
  }));
  $("#capture").hidden = !state.pending;
  const selectedType = state.pending && $("#block-type").dataset.captureId === state.pending.id ? $("#block-type").value : inferTypeKey(state.pending);
  renderTypeOptions(selectedType);
  if (state.pending) {
    $("#capture-title").textContent = state.pending.title;
    $("#capture-registry").textContent = state.pending.sourceDomain || state.pending.registry || "";
    $("#position").value = state.spec.blocks.length + 1;
    if ($("#block-type").dataset.captureId !== state.pending.id) {
      $("#instructions").value = state.pending.selectionText || "";
      $("#block-type").dataset.captureId = state.pending.id;
    }
  }
}

function singleBlockPrompt(block) {
  return JSON.stringify({
    schemaVersion: 1,
    kind: "single-block",
    task: t("singleAgentTask"),
    source: {
      title: block.title,
      url: block.url,
      domain: block.sourceDomain,
      slug: block.slug,
      capturedAt: block.capturedAt,
      selectedText: block.selectionText || null
    },
    section: {
      typeKey: normalizeTypeKey(block),
      label: MESSAGES[state.locale].types[normalizeTypeKey(block)]
    },
    implementationNotes: block.instructions || t("fallbackChange"),
    screenshotIncluded: Boolean(block.screenshotId),
    accessPolicy: t("singleAccessPolicy")
  }, null, 2);
}

async function copySingleItem() {
  if (!state.singleItem) return;
  const text = singleBlockPrompt(state.singleItem);
  const screenshot = state.singleItem.screenshotId && state.screenshots[state.singleItem.screenshotId];
  if (screenshot && globalThis.ClipboardItem && navigator.clipboard.write) {
    try {
      const image = await fetch(screenshot).then(response => response.blob());
      const item = new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "image/png": image
      });
      await navigator.clipboard.write([item]);
      status(t("singleCopiedWithScreenshot"));
      return;
    } catch {}
  }
  await navigator.clipboard.writeText(text);
  status(t("singleCopied"));
}

async function clearSingleItem() {
  if (state.singleItem?.screenshotId) delete state.screenshots[state.singleItem.screenshotId];
  state.singleItem = null;
  await chrome.storage.local.set({ singleItem: null, screenshots: state.screenshots });
  render();
}

async function move(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= state.spec.blocks.length) return;
  [state.spec.blocks[index], state.spec.blocks[target]] = [state.spec.blocks[target], state.spec.blocks[index]];
  await persist();
}

async function updateBlockInstructions(index, value, button) {
  const block = state.spec.blocks[index];
  if (!block) return;
  const previous = block.instructions || "";
  button.disabled = true;
  try {
    block.instructions = value.trim();
    await persist();
    status(t("notesSaved"));
  } catch (error) {
    block.instructions = previous;
    render();
    status(`${t("notesSaveFailed")}: ${error.message}`);
  }
}

async function remove(index) {
  const [block] = state.spec.blocks.splice(index, 1);
  if (block?.screenshotId) {
    delete state.screenshots[block.screenshotId];
    await chrome.storage.local.set({ screenshots: state.screenshots });
  }
  await persist();
}

async function cropScreenshot(dataUrl, rect, viewport) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const scaleX = image.naturalWidth / viewport.width;
  const scaleY = image.naturalHeight / viewport.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(rect.width * scaleX));
  canvas.height = Math.max(1, Math.round(rect.height * scaleY));
  const context = canvas.getContext("2d");
  context.drawImage(
    image,
    Math.round(rect.left * scaleX),
    Math.round(rect.top * scaleY),
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas.toDataURL("image/png");
}

async function addVisualReference() {
  const button = $("#add-screenshot");
  button.disabled = true;
  try {
    await requestCapturePermission();
    status(t("selectRegionStatus"));
    const response = await chrome.runtime.sendMessage({
      type: "capture-selected-region",
      labels: { hint: t("regionSelectionHint"), cancel: t("regionSelectionCancel"), noActivePage: t("noActiveWebPage") }
    });
    if (response?.canceled) return status(t("regionSelectionCanceled"));
    if (!response?.ok) throw new Error(response?.error || t("unknownError"));
    const screenshotDataUrl = await cropScreenshot(response.dataUrl, response.rect, response.viewport);
    const id = crypto.randomUUID();
    const slug = `visual-reference-${state.spec.blocks.length + 1}`;
    const block = {
      id,
      kind: "visual-reference",
      title: response.page.title,
      url: response.page.url,
      sourceDomain: response.page.sourceDomain,
      slug,
      typeKey: "other",
      instructions: "",
      capturedAt: new Date().toISOString(),
      screenshotId: id,
      screenshotPath: `references/${String(state.spec.blocks.length + 1).padStart(2, "0")}-${slug}.png`
    };
    state.screenshots[id] = screenshotDataUrl;
    state.spec.blocks.push(block);
    state.expandedBlockId = id;
    state.pending = null;
    state.workflowDrafts.page = null;
    await chrome.storage.local.remove("pendingCapture");
    await chrome.storage.local.set({ screenshots: state.screenshots, workflowDrafts: state.workflowDrafts });
    await persist();
    status(t("visualReferenceAdded"));
  } catch (error) {
    status(`${t("regionCaptureFailed")}: ${error.message}`);
  } finally {
    button.disabled = false;
  }
}
function status(text) { $("#status").textContent = text; setTimeout(() => $("#status").textContent = "", 3500); }

async function requestCapturePermission() {
  const granted = await chrome.permissions.request({ origins: [APP_CONFIG.allowedHostPattern] });
  if (!granted) throw new Error(t("siteAccessRequired"));
}

async function captureActiveFromPanel(button) {
  button.disabled = true;
  try {
    await requestCapturePermission();
    const response = await chrome.runtime.sendMessage({ type: "capture-active" });
    if (!response?.ok) throw new Error(response?.error || t("unknownError"));
    status(t("currentPageCaptured"));
  } catch (error) {
    status(`${t("captureFailed")}: ${error.message}`);
  } finally {
    button.disabled = false;
  }
}

async function discardPending() {
  const button = $("#discard");
  button.disabled = true;
  state.pending = null;
  state.workflowDrafts[state.workflowMode] = null;
  $("#capture").hidden = true;
  delete $("#block-type").dataset.captureId;
  try {
    await chrome.storage.local.remove("pendingCapture");
    await chrome.storage.local.set({ workflowDrafts: state.workflowDrafts });
    status(t("blockDiscarded"));
  } catch (error) {
    status(`${t("discardFailed")}: ${error.message}`);
  } finally {
    button.disabled = false;
    render();
  }
}

$("#settings-toggle").onclick = () => setSettingsExpanded(!state.settingsExpanded);
document.querySelectorAll("[data-workflow-mode]").forEach(button => {
  button.onclick = () => setWorkflowMode(button.dataset.workflowMode);
  button.onkeydown = event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const next = button.dataset.workflowMode === "page" ? "single" : "page";
    void setWorkflowMode(next).then(() => $(`[data-workflow-mode="${next}"]`).focus());
  };
});
$("#add-current-page").onclick = () => captureActiveFromPanel($("#add-current-page"));
$("#single-capture").onclick = () => captureActiveFromPanel($("#single-capture"));
$("#add-screenshot").onclick = addVisualReference;
$("#copy-single").onclick = copySingleItem;
$("#clear-single").onclick = clearSingleItem;
$("#copy-collection-id").onclick = async () => {
  await navigator.clipboard.writeText($("#collection-id").textContent);
  status(t("numberCopied"));
};
$("#saved-pages").onchange = async event => {
  const next = state.workspace.specs.find(spec => spec.id === event.target.value);
  if (!next) return;
  state.spec = next;
  state.spec.projectDirectory ||= "";
  state.spec.pageMode ||= "create";
  await persist();
};
$("#new-project").onclick = async () => {
  const selected = await requestProjectFolder();
  if (!selected) return;
  const page = prompt(t("pageNamePrompt"), t("defaultPageName"));
  if (!page?.trim()) return;
  const usesDefaultPage = page.trim() === t("defaultPageName");
  await createSpec(selected.name, page.trim(), usesDefaultPage ? { pageLabelKey: "defaultPageName" } : {});
  state.spec.projectDirectory = selected.directory;
  state.settingsExpanded = false;
  await chrome.storage.local.set({ settingsExpanded: false });
  await persist();
};
$("#new-page").onclick = async () => {
  const page = prompt(t("pageNamePrompt"), "");
  if (page?.trim()) await createSpec(state.spec.project, page.trim(), { projectLabelKey: state.spec.projectLabelKey });
};
$("#choose-folder").onclick = chooseFolderForCurrentSpec;
for (const field of ["page", "route"]) $("#" + field).onchange = async event => {
  state.spec[field] = event.target.value.trim();
  if (field === "page") delete state.spec.pageLabelKey;
  await persist();
};
$("#page-mode").onchange = async event => { state.spec.pageMode = event.target.value; await persist(); };
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
    const position = state.workflowMode === "single" ? 0 : Math.max(0, Math.min(state.spec.blocks.length, Number($("#position").value) - 1));
    const block = { ...state.pending, typeKey: $("#block-type").value, instructions: $("#instructions").value.trim() };
    if (screenshotDataUrl) {
      block.screenshotId = block.id;
      if (state.workflowMode === "page") block.screenshotPath = `references/${String(position + 1).padStart(2, "0")}-${safeFileName(block.slug)}.png`;
      state.screenshots[block.screenshotId] = screenshotDataUrl;
    }
    if (state.workflowMode === "single") {
      if (state.singleItem?.screenshotId && state.singleItem.screenshotId !== block.screenshotId) delete state.screenshots[state.singleItem.screenshotId];
      state.singleItem = block;
      await chrome.storage.local.set({ singleItem: block, screenshots: state.screenshots });
    } else {
      state.spec.blocks.splice(position, 0, block);
      await chrome.storage.local.set({ screenshots: state.screenshots });
    }
    state.pending = null;
    state.workflowDrafts[state.workflowMode] = null;
    await chrome.storage.local.remove("pendingCapture");
    await chrome.storage.local.set({ workflowDrafts: state.workflowDrafts });
    if (state.workflowMode === "page") await persist();
    else render();
    status(t(state.workflowMode === "single" ? "singlePrepared" : "blockAdded"));
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
  if (response?.ok) {
    $("#collection-id").textContent = response.collectionId;
    $("#collection-path").textContent = response.directory;
    $("#collection-path").title = response.directory;
    $("#export-result").hidden = false;
    status(`${t("saved")}: ${response.directory}`);
  } else {
    status(`${t("exportFailed")}: ${response?.error || t("unknownError")}`);
  }
};
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && changes.pendingCapture) {
    const pending = changes.pendingCapture.newValue || null;
    const existing = state.workflowMode === "page" && pending && state.spec.blocks.find(block => block.kind !== "visual-reference" && block.url === pending.url);
    if (existing) {
      state.pending = null;
      state.workflowDrafts.page = null;
      state.expandedBlockId = existing.id;
      await chrome.storage.local.remove("pendingCapture");
      await chrome.storage.local.set({ workflowDrafts: state.workflowDrafts });
      status(t("alreadyAdded"));
    } else {
      state.pending = pending;
      state.workflowDrafts[state.workflowMode] = pending;
      await chrome.storage.local.set({ workflowDrafts: state.workflowDrafts });
    }
    await chrome.runtime.sendMessage({ type: "panel-ready" });
    render();
  }
});
hydrate();
