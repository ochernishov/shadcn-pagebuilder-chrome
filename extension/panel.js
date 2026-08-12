import { DEFAULT_LOCALE, LOCALES, MESSAGES, localizeSystemLabels, migrateSystemLabels, translate } from "./i18n.js";

const TYPE_KEYS = ["hero", "navigation", "dashboard", "applicationShell", "dataTable", "logos", "features", "content", "steps", "cta", "pricing", "testimonials", "faq", "footer", "other"];
const $ = selector => document.querySelector(selector);
const state = { spec: null, pending: null, locale: DEFAULT_LOCALE, workspace: null, expandedBlockId: null, screenshots: {} };
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
  const stored = await chrome.storage.local.get(["pageSpec", "workspace", "pendingCapture", "locale", "screenshots"]);
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
  state.screenshots = stored.screenshots || {};
  state.pending = stored.pendingCapture || null;
  const existing = state.pending && state.spec.blocks.find(block => block.kind !== "visual-reference" && block.url === state.pending.url);
  if (existing) {
    state.expandedBlockId = existing.id;
    state.pending = null;
    await chrome.storage.local.remove("pendingCapture");
  }
  render();
  if (existing) status(t("alreadyAdded"));
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
  const response = await chrome.runtime.sendMessage({ type: "native", payload: { action: "choose-directory", prompt: t("projectFolder") } });
  if (response?.ok) return response;
  if (!response?.canceled) status(`${t("chooseFolderFailed")}: ${response?.error || t("unknownError")}`);
  return null;
}

async function chooseFolderForCurrentSpec() {
  const selected = await requestProjectFolder();
  if (!selected) return;
  state.spec.projectDirectory = selected.directory;
  state.spec.project = selected.name;
  delete state.spec.projectLabelKey;
  await persist();
}

function render() {
  applyTranslations();
  renderLanguageSwitcher();
  renderWorkspace();
  renderPageMode();
  $("#project-folder").textContent = state.spec.projectDirectory || t("noFolder");
  $("#project-folder").title = state.spec.projectDirectory || t("noFolder");
  $("#page").value = state.spec.page;
  $("#route").value = state.spec.route;
  $("#page-title").textContent = state.spec.page;
  $("#count").textContent = state.spec.blocks.length;
  $("#empty").hidden = state.spec.blocks.length > 0;
  $("#blocks").replaceChildren(...state.spec.blocks.map((block, index) => {
    const li = document.createElement("li");
    li.className = "block";
    const expanded = state.expandedBlockId === block.id;
    li.setAttribute("aria-expanded", String(expanded));
    li.innerHTML = `<div class="block-summary"><span class="block-order">${String(index + 1).padStart(2, "0")}</span><div class="block-copy"><strong></strong><small></small></div><button type="button">↑</button><button type="button">↓</button><button type="button">×</button><button type="button" class="block-toggle">⌄</button></div><div class="block-details" ${expanded ? "" : "hidden"}><a target="_blank" rel="noreferrer"></a><span class="detail-registry"></span><code class="detail-install"></code><p class="detail-notes"></p><span class="detail-screenshot"></span></div>`;
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
    li.querySelector(".detail-notes").textContent = block.instructions ? `${t("notesLabel")}: ${block.instructions}` : "";
    li.querySelector(".detail-screenshot").textContent = block.screenshotId ? `✓ ${t("screenshotIncluded")}` : "";
    if (block.screenshotId && state.screenshots[block.screenshotId]) {
      const preview = document.createElement("img");
      preview.className = "block-preview";
      preview.src = state.screenshots[block.screenshotId];
      preview.alt = t("screenshotPreviewAlt");
      li.querySelector(".block-details").append(preview);
    }
    const buttons = li.querySelectorAll("button");
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

async function move(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= state.spec.blocks.length) return;
  [state.spec.blocks[index], state.spec.blocks[target]] = [state.spec.blocks[target], state.spec.blocks[index]];
  await persist();
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
  status(t("selectRegionStatus"));
  try {
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
    await chrome.storage.local.remove("pendingCapture");
    await chrome.storage.local.set({ screenshots: state.screenshots });
    await persist();
    status(t("visualReferenceAdded"));
  } catch (error) {
    status(`${t("regionCaptureFailed")}: ${error.message}`);
  } finally {
    button.disabled = false;
  }
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
$("#add-screenshot").onclick = addVisualReference;
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
    const position = Math.max(0, Math.min(state.spec.blocks.length, Number($("#position").value) - 1));
    const block = { ...state.pending, typeKey: $("#block-type").value, instructions: $("#instructions").value.trim() };
    if (screenshotDataUrl) {
      block.screenshotId = block.id;
      block.screenshotPath = `references/${String(position + 1).padStart(2, "0")}-${safeFileName(block.slug)}.png`;
      state.screenshots[block.screenshotId] = screenshotDataUrl;
      await chrome.storage.local.set({ screenshots: state.screenshots });
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
    const existing = pending && state.spec.blocks.find(block => block.kind !== "visual-reference" && block.url === pending.url);
    if (existing) {
      state.pending = null;
      state.expandedBlockId = existing.id;
      await chrome.storage.local.remove("pendingCapture");
      status(t("alreadyAdded"));
    } else {
      state.pending = pending;
    }
    render();
  }
});
hydrate();
