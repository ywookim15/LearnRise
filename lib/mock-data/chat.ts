// MOCK DATA — static "Ask METIS" chat transcripts. No real AI in this phase.

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export type ChatTab = "main" | "planner" | "tutor";

export const chatTabs: { id: ChatTab; label: string; blurb: string }[] = [
  { id: "main", label: "Main", blurb: "General questions about your journey" },
  { id: "planner", label: "Planner", blurb: "Adjust pacing, scope, and schedule" },
  { id: "tutor", label: "Tutor", blurb: "Work through a concept step by step" },
];

export const mockChats: Record<ChatTab, ChatMessage[]> = {
  main: [
    {
      id: "m1",
      role: "assistant",
      text: "Hi Jane — I'm METIS. Ask me anything about this journey, or tap Planner to reshape the roadmap and Tutor to work through a tricky concept.",
    },
    {
      id: "m2",
      role: "user",
      text: "Which unit should I focus on before my system design interview?",
    },
    {
      id: "m3",
      role: "assistant",
      text: "Given your interview timeline, I'd prioritize Unit 2 (Scaling Patterns) and the Consensus chapter in Unit 3. You've already got the foundations down. (This is placeholder guidance — real reasoning arrives in Phase 2.)",
    },
  ],
  planner: [
    {
      id: "p1",
      role: "assistant",
      text: "I'm your Planner. Tell me your deadline or weekly hours and I'll re-pace the roadmap.",
    },
    {
      id: "p2",
      role: "user",
      text: "I only have 3 hours a week for the next month.",
    },
    {
      id: "p3",
      role: "assistant",
      text: "Got it — I'd trim optional labs and spread the three units across four weeks, ~45 min per session. Here's a placeholder schedule you can approve. (Static preview for now.)",
    },
  ],
  tutor: [
    {
      id: "t1",
      role: "assistant",
      text: "I'm your Tutor. Point me at a resource or concept and I'll walk you through it with questions, not just answers.",
    },
    {
      id: "t2",
      role: "user",
      text: "Explain the CAP theorem like I'm new to it.",
    },
    {
      id: "t3",
      role: "assistant",
      text: "Let's start with a question: if two servers can't talk to each other, would you rather they both keep answering (risking disagreement) or one stops answering (staying correct)? Your answer tells us which side of CAP you're on. (Placeholder Socratic reply.)",
    },
  ],
};
