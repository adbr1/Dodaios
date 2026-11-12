import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BotStage } from "./BotStage";
vi.mock("@/i18n", () => ({ useT: () => (key: string) => key }));
afterEach(cleanup);
it("announces activity without mounting an animated avatar", () => {
  const { container, rerender } = render(<BotStage presence="thinking" seed="turn" color="#fff" avatar={<canvas />} />);
  expect(screen.getByRole("status").textContent).toBe("bot_stage.ponder");
  expect(container.querySelector("canvas, svg, img")).toBeNull();
  rerender(<BotStage presence="working" seed="turn" color="#fff" avatar={<canvas />} words="Reading a file" />);
  expect(screen.getByRole("status").textContent).toBe("Reading a file");
});
