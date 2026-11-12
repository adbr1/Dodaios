import { useEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "@/i18n";
import type { Presence } from "../messengerPresence";

const STATUS: Record<Presence, string> = {
  thinking: "ponder", writing: "note", searching: "scan", recall: "recall",
  browsing: "browser", setting_up: "setup", command: "command", working: "build",
  typing: "typing", reading: "reading", done: "done",
};

/** A quiet activity label; agent work never starts a cosmetic animation. */
export function BotStage({ presence, words, announce = true }: {
  presence: Presence;
  seed: string;
  avatar: ReactNode;
  color: string;
  words?: ReactNode;
  wordsId?: string;
  announce?: boolean;
}) {
  const t = useT();
  const label = t(`bot_stage.${STATUS[presence]}`);
  return <div className="text-sm text-muted-foreground"
    role={announce ? "status" : undefined} aria-label={announce ? label : undefined}
    data-testid="messenger-presence" data-presence={presence}>
    {words ?? label}
  </div>;
}

/** "Typing" only while the words are still arriving; a pause is thinking again. */
export function useTypingPresence(presence: Presence | null, textLength: number): Presence | null {
  const [grewAt, setGrewAt] = useState(0);
  const [, tick] = useState(0);
  const last = useRef(textLength);
  useEffect(() => {
    if (textLength !== last.current) {
      last.current = textLength;
      setGrewAt(Date.now());
    }
  }, [textLength]);
  const fresh = Date.now() - grewAt < 1200;
  useEffect(() => {
    if (presence !== "typing" || !fresh) return;
    const id = window.setTimeout(() => tick((n) => n + 1), 1250);
    return () => window.clearTimeout(id);
  }, [presence, fresh, grewAt]);
  return presence === "typing" && !fresh ? "thinking" : presence;
}
