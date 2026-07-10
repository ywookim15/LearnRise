"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsRight, Send, Sparkles, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProGate } from "@/components/shared/pro-gate";
import { chatTabs, type ChatTab } from "@/lib/mock-data/chat";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  pending?: boolean;
}

const INTRO: Record<ChatTab, string> = {
  main: "Hi — I'm METIS. Ask me anything about this journey. I can also re-plan upcoming units or refresh a chapter's resources if you ask.",
  planner: "I'm your Planner. Tell me your deadline, weekly hours, or how you want to re-pace things and I'll re-plan your upcoming chapters (finished ones stay put).",
  tutor: "I'm your Tutor. Point me at a concept or resource and I'll walk you through it — questions first, answers second.",
};

let mid = 0;
const newId = () => `m${mid++}`;

export function AskMetisPanel({
  journeyId,
  onCollapse,
  onRoadmapChanged,
}: {
  journeyId: string;
  onCollapse: () => void;
  onRoadmapChanged?: () => void;
}) {
  const [tab, setTab] = useState<ChatTab>("main");
  const [threads, setThreads] = useState<Record<ChatTab, Message[]>>({
    main: [{ id: newId(), role: "assistant", text: INTRO.main }],
    planner: [{ id: newId(), role: "assistant", text: INTRO.planner }],
    tutor: [{ id: newId(), role: "assistant", text: INTRO.tutor }],
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [threads, tab]);

  function push(t: ChatTab, msg: Message) {
    setThreads((prev) => ({ ...prev, [t]: [...prev[t], msg] }));
  }
  function replace(t: ChatTab, id: string, patch: Partial<Message>) {
    setThreads((prev) => ({
      ...prev,
      [t]: prev[t].map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const activeTab = tab;
    setInput("");
    setSending(true);

    push(activeTab, { id: newId(), role: "user", text });
    const placeholderId = newId();
    push(activeTab, { id: placeholderId, role: "assistant", text: "", pending: true });

    try {
      const res = await fetch(`/api/journeys/${journeyId}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, mode: activeTab }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.code === "chat_limit") {
          setThreads((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].filter((m) => m.id !== placeholderId),
          }));
          setLimitReached(true);
          return;
        }
        throw new Error(json.error || "METIS couldn't respond. Please try again.");
      }

      replace(activeTab, placeholderId, { text: json.reply, pending: false });
      if (json.roadmapUpdating) {
        push(activeTab, {
          id: newId(),
          role: "system",
          text: "Updating your roadmap — new units and resources will appear shortly.",
        });
        onRoadmapChanged?.();
      }
    } catch (err) {
      replace(activeTab, placeholderId, {
        text: err instanceof Error ? err.message : "Something went wrong.",
        pending: false,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-card md:w-[46%] md:min-w-[380px]">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">Ask METIS</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {chatTabs.find((t) => t.id === tab)?.blurb}
            </p>
          </div>
        </div>
        <button
          onClick={onCollapse}
          aria-label="Collapse chat"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
      </div>

      <ProGate
        active={limitReached}
        title="Usage ran out"
        subtitle="You've used all of today's free messages. Upgrade to Pro for unlimited chat with METIS."
        className="flex min-h-0 flex-1 flex-col"
        contentClassName="flex min-h-0 flex-1 flex-col"
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as ChatTab)} className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3">
            <TabsList className="w-full">
              {chatTabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="flex-1">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {chatTabs.map((t) => (
            <TabsContent
              key={t.id}
              value={t.id}
              ref={t.id === tab ? scrollRef : undefined}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto scrollbar-slim px-4 py-4"
            >
              {threads[t.id].map((m) =>
                m.role === "system" ? (
                  <div key={m.id} className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    {m.text}
                  </div>
                ) : (
                  <MessageBubble key={m.id} role={m.role} text={m.text} pending={m.pending} />
                )
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              disabled={sending}
              placeholder={`Message METIS (${chatTabs.find((t) => t.id === tab)?.label})…`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
            />
            <button
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-white transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </ProGate>
    </aside>
  );
}

function MessageBubble({
  role,
  text,
  pending,
}: {
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground"
        )}
      >
        {pending ? <TypingDots /> : text}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
