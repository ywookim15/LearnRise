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
