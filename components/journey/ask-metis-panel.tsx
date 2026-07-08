"use client";

import { useState } from "react";
import { ChevronsRight, Send, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { chatTabs, mockChats, type ChatTab } from "@/lib/mock-data/chat";
import { cn } from "@/lib/utils";

/**
 * Static "Ask METIS" chat shell. Tabs switch between placeholder transcripts;
 * the composer is inert. No real AI in this phase.
 */
export function AskMetisPanel({ onCollapse }: { onCollapse: () => void }) {
  const [tab, setTab] = useState<ChatTab>("main");

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-card md:w-[46%] md:min-w-[380px]">
      {/* Header */}
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

      {/* Tabs */}
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
            className="min-h-0 flex-1 space-y-4 overflow-y-auto scrollbar-slim px-4 py-4"
          >
            {mockChats[t.id].map((m) => (
              <MessageBubble key={m.id} role={m.role} text={m.text} />
            ))}
            <p className="pt-2 text-center text-[11px] text-muted-foreground">
              Static preview — responses are placeholders.
            </p>
          </TabsContent>
        ))}
      </Tabs>

      {/* Composer (inert) */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
          <input
            disabled
            placeholder="Message METIS… (disabled in prototype)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-white opacity-60"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MessageBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
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
        {text}
      </div>
    </div>
  );
}
