import { afterEach, describe, expect, it, vi } from "vitest";
import { localeForUiLanguage } from "@/components/runs/format";
import { fmtInt } from "@/components/runs/format";

const sources = import.meta.glob("./locales/**/*en.json", { eager: true, import: "default" });
const targets = import.meta.glob("./locales/**/*fr.json", { eager: true, import: "default" });

function leaves(value: unknown, prefix = ""): Record<string, unknown> {
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
      Object.entries(leaves(child, prefix ? `${prefix}.${key}` : key)),
    ));
  }
  return { [prefix]: value };
}

const placeholders = (value: unknown) => typeof value === "string"
  ? (value.match(/\{\w+\}/g) ?? []).sort() : [];

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("French (France) dictionaries", () => {
  for (const [path, source] of Object.entries(sources)) {
    const targetPath = path.replace(/en\.json$/, "fr.json");
    it(`${path}: preserves every key and interpolation`, () => {
      expect(targets[targetPath], targetPath).toBeDefined();
      const en = leaves(source);
      const fr = leaves(targets[targetPath]);
      expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
      const errors = Object.entries(en).filter(([key, value]) =>
        typeof fr[key] !== typeof value ||
        (typeof value === "string" && value.trim() !== "" && !String(fr[key]).trim()) ||
        placeholders(value).join("|") !== placeholders(fr[key]).join("|"),
      ).map(([key]) => key);
      expect(errors).toEqual([]);
    });
  }

  it("formats dates, numbers and plurals with French regional rules", () => {
    expect(localeForUiLanguage("fr")).toBe("fr-FR");
    expect(localeForUiLanguage("fr-FR")).toBe("fr-FR");
    expect(fmtInt(12345, "fr-FR")).toBe("12\u202f345");
    expect(new Intl.NumberFormat("fr-FR").format(1.5)).toBe("1,5");
    expect(new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" }).format(new Date("2026-11-11"))).toBe("11/11/2026");
    expect([0, 1, 2].map(n => new Intl.PluralRules("fr-FR").select(n))).toEqual(["one", "one", "other"]);
  });

  it("loads French lazily, preserves it across a client restart and hydrates the server choice", async () => {
    vi.resetModules();
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ language: "fr" }) });
    vi.stubGlobal("fetch", fetcher);
    let i18n = await import("./index");
    i18n.setUiLanguage("fr");
    await i18n.loadUiLocale("fr");
    expect(i18n.translate("common.save")).toBe("Enregistrer");
    expect(document.documentElement.lang).toBe("fr-FR");
    expect(localStorage.getItem("jarvis.ui.language")).toBe("fr");
    expect(fetcher).toHaveBeenCalledWith("/api/settings/ui-language", expect.objectContaining({
      method: "PUT", body: JSON.stringify({ language: "fr" }),
    }));
    vi.resetModules();
    i18n = await import("./index");
    expect(i18n.useI18nStore.getState().ui).toBe("fr");
    await i18n.loadUiLocale("fr");
    expect(i18n.translate("common.cancel")).toBe("Annuler");
    i18n.useI18nStore.getState().setUi("en", { push: false });
    await i18n.hydrateUiLanguage();
    expect(i18n.useI18nStore.getState().ui).toBe("fr");
  });

  it("keeps the English fallback for a missing French label", async () => {
    const i18n = await import("./index");
    await i18n.loadUiLocale("fr");
    const english = i18n.uiDictionary("en");
    english.french_fallback_probe = "English fallback";
    try {
      i18n.useI18nStore.getState().setUi("fr", { push: false });
      expect(i18n.translate("french_fallback_probe")).toBe("English fallback");
      expect(i18n.translate("unknown.translation.key")).toBe("unknown.translation.key");
    } finally {
      delete english.french_fallback_probe;
      i18n.useI18nStore.getState().setUi("en", { push: false });
    }
  });
});
