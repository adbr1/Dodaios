import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentSwatch } from "./AgentSwatch";

const agent = { name: "Research Assistant", figure: null,
  palette: { primary: "#111111", secondary: "#222222", accent: "#333333" } };
afterEach(cleanup);

describe("static agent identity", () => {
  it("shows initials without loading or animating an avatar", () => {
    const { container, rerender } = render(<AgentSwatch agent={agent} size={40} />);
    expect(container.firstElementChild?.getAttribute("data-initials")).toBe("RA");
    expect(container.querySelector("canvas, svg, img, [data-agent-working]")).toBeNull();
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    rerender(<AgentSwatch agent={{ ...agent, state: "working" }} size={40} />);
    expect(container.firstElementChild?.getAttribute("data-initials")).toBe("RA");
    expect(container.querySelector("[data-thinking]")).toBeNull();
  });

  it("updates initials when an agent is renamed", () => {
    const { container, rerender } = render(<AgentSwatch agent={agent} />);
    rerender(<AgentSwatch agent={{ ...agent, name: "Ada" }} />);
    expect(container.firstElementChild?.getAttribute("data-initials")).toBe("A");
  });
});
