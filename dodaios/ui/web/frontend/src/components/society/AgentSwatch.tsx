import { cn } from "@/lib/utils";
import { resolveCompanion } from "./companion/appearance";
import type { SocietyAgent } from "./data";

type SwatchAgent = Pick<SocietyAgent, "figure" | "palette" | "name"> &
  Partial<Pick<SocietyAgent, "agentId" | "tier" | "state">>;

export const LEAD_COLOR = "#ffcd61";

/** Keep saved agent colours while presenting a static, accessible monogram. */
export function agentColor(agent: SwatchAgent): string {
  return agent.tier === "lead" ? LEAD_COLOR
    : resolveCompanion(agent.agentId || agent.name, agent.figure?.companion).color;
}

export function AgentSwatch({ agent, size = 36, className }: {
  agent: SwatchAgent;
  size?: number;
  className?: string;
  /** Kept for existing callers; agent identity no longer animates. */
  expressive?: boolean;
}) {
  const initials = agent.name.trim().split(/\s+/u).slice(0, 2)
    .map(part => Array.from(part)[0] ?? "").join("").toLocaleUpperCase();
  return <span aria-hidden data-initials={initials || "?"} className={cn(
    "before:content-[attr(data-initials)] inline-flex shrink-0 select-none items-center justify-center rounded-md border border-border bg-secondary font-medium text-foreground",
    className,
  )} style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) }}>
  </span>;
}
