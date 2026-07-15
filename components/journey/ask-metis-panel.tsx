"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronsRight, Send, RefreshCw } from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
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
  const t = useTranslations("app.ask");
  const [tab, setTab] = useState<ChatTab>("main");
  const [threads, setThreads] = useState<Record<ChatTab, Message[]>>(() => ({
    main: [{ id: newId(), role: "assistant", text: t("intro.main") }],
    planner: [{ id: newId(), role: "assistant", text: t("intro.planner") }],
    tutor: [{ id: newId(), role: "assistant", text: t("intro.tutor") }],
  }));
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

  async function send(override?: string) {
    const text = (override ?? input).trim();
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
        throw new Error(json.error || t("errorRespond"));
      }

      replace(activeTab, placeholderId, { text: json.reply, pending: false });
      if (json.roadmapUpdating) {
        push(activeTab, {
          id: newId(),
          role: "system",
          text: t("roadmapUpdating"),
        });
        onRoadmapChanged?.();
      }
    } catch (err) {
      replace(activeTab, placeholderId, {
        text: err instanceof Error ? err.message : t("errorGeneric"),
        pending: false,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-card md:w-[46%] md:min-w-[380px]">
      <div className="relative flex items-center justify-between gap-2 overflow-hidden border-b border-border bg-brand-gradient px-4 py-3.5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-20" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white">
            <LogoMark className="h-5 w-auto" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">{t("title")}</p>
            <p className="mt-1 text-[11px] text-white/80">
              {t(`tabs.${tab}.blurb`)}
            </p>
          </div>
        </div>
        <button
          onClick={onCollapse}
          aria-label={t("collapseChat")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>
      </div>

      <ProGate
        active={limitReached}
        title={t("limitTitle")}
        subtitle={t("limitSubtitle")}
        className="flex min-h-0 flex-1 flex-col"
        contentClassName="flex min-h-0 flex-1 flex-col"
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as ChatTab)} className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3">
            <TabsList className="w-full">
              {chatTabs.map((ct) => (
                <TabsTrigger key={ct.id} value={ct.id} className="flex-1">
                  {t(`tabs.${ct.id}.label`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {chatTabs.map((ct) => (
            <TabsContent
              key={ct.id}
              value={ct.id}
              ref={ct.id === tab ? scrollRef : undefined}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto scrollbar-slim px-4 py-4"
            >
              {threads[ct.id].map((m) =>
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

        <div className="border-t border-border px-3 pt-3">
          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-slim">
            {(t.raw(`suggestions.${tab}`) as string[]).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => void send(suggestion)}
                disabled={sending}
                className="shrink-0 whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 mb-3">
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
              placeholder={t("placeholder", { tab: t(`tabs.${tab}.label`) })}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
            />
            <button
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-white transition-opacity disabled:opacity-40"
              aria-label={t("send")}
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
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere]",
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
