import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LanguagesGroup } from "./LanguagesGroup";
import { loadUiLocale, useI18nStore } from "@/i18n";

afterEach(() => {
  cleanup();
  useI18nStore.getState().setUi("en", { push: false });
  localStorage.clear();
  vi.unstubAllGlobals();
});

it("offers Français and switches the actual settings labels after selection", async () => {
  let saved = "en";
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith("ui-language")) {
      if (init?.method === "PUT") saved = JSON.parse(String(init.body)).language;
      return { ok: true, json: async () => ({ language: saved, persisted: true }) };
    }
    return { ok: true, json: async () => ({ language: "auto", options: ["auto", "en", "fr"] }) };
  });
  vi.stubGlobal("fetch", fetcher);
  useI18nStore.getState().setUi("en", { push: false });
  render(<LanguagesGroup />);
  await waitFor(() => expect(fetcher).toHaveBeenCalled());
  fireEvent.click(screen.getByTestId("ui-language"));
  fireEvent.click(await screen.findByRole("option", { name: "Français" }));
  await loadUiLocale("fr");
  await waitFor(() => expect(screen.getByText("Langue de l’interface")).toBeDefined());
  expect(screen.getByTestId("ui-language").textContent).toContain("Français");
  expect(saved).toBe("fr");
  expect(document.documentElement.lang).toBe("fr-FR");
  expect(localStorage.getItem("jarvis.ui.language")).toBe("fr");
});
