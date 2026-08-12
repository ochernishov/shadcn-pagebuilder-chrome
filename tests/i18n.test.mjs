import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { DEFAULT_LOCALE, LOCALES, MESSAGES, migrateSystemLabels } from "../extension/i18n.js";

test("English is the default and all requested locales exist", () => {
  assert.equal(DEFAULT_LOCALE, "en");
  assert.deepEqual(LOCALES.map(locale => locale.id), ["en", "ru", "fr", "it", "zh"]);
});

test("all locales expose the same UI and type keys", () => {
  const locales = LOCALES.map(locale => locale.id);
  const referenceKeys = Object.keys(MESSAGES.en).sort();
  const typeKeys = Object.keys(MESSAGES.en.types).sort();
  for (const locale of locales) {
    assert.deepEqual(Object.keys(MESSAGES[locale]).sort(), referenceKeys, locale);
    assert.deepEqual(Object.keys(MESSAGES[locale].types).sort(), typeKeys, locale);
    assert.equal(MESSAGES[locale].agentSteps.length, 7, locale);
  }
});

test("every HTML translation key exists in every locale", () => {
  const html = fs.readFileSync("extension/panel.html", "utf8");
  const keys = [...html.matchAll(/data-i18n(?:-title|-placeholder|-aria-label)?="([^"]+)"/g)].map(match => match[1]);
  for (const locale of LOCALES.map(item => item.id)) {
    for (const key of keys) assert.ok(MESSAGES[locale][key], `${locale}.${key}`);
  }
});

test("system default names follow the selected locale while user names remain unchanged", () => {
  const legacy = { project: "My Website", projectDirectory: "", page: "Лендинг", blocks: [] };
  migrateSystemLabels(legacy, "fr", { project: "My Website", page: "Landing Page" });
  assert.equal(legacy.project, "Mon site");
  assert.equal(legacy.page, "Page d’accueil");
  assert.equal(legacy.projectLabelKey, "defaultProjectName");
  assert.equal(legacy.pageLabelKey, "defaultPageName");

  const userNamed = { project: "Acme", projectDirectory: "/projects/acme", page: "Pricing", blocks: [] };
  migrateSystemLabels(userNamed, "zh", { project: "My Website", page: "Landing Page" });
  assert.equal(userNamed.project, "Acme");
  assert.equal(userNamed.page, "Pricing");
  assert.equal(userNamed.projectLabelKey, undefined);
  assert.equal(userNamed.pageLabelKey, undefined);
});

test("translations contain no empty strings", () => {
  for (const locale of LOCALES.map(item => item.id)) {
    for (const [key, value] of Object.entries(MESSAGES[locale])) {
      if (Array.isArray(value)) assert.ok(value.every(Boolean), `${locale}.${key}`);
      else if (typeof value === "object") assert.ok(Object.values(value).every(Boolean), `${locale}.${key}`);
      else assert.ok(value, `${locale}.${key}`);
    }
  }
});
