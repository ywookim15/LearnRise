// MOCK DATA — learning journeys, roadmaps, units, chapters, resources.
// All hardcoded/placeholder. No backend. Replace wholesale in Phase 2.

export type ResourceType = "video" | "article" | "lab" | "reading" | "quiz";

export interface Resource {
  id: string;
  label: string; // e.g. "1-1"
  title: string;
  source: string; // e.g. "MIT OpenCourseWare"
  type: ResourceType;
  duration: string; // e.g. "15 min"
  completed: boolean;
  preview: string; // shown in hover preview card
}

export interface Chapter {
  id: string;
  title: string;
  aiOverview: string;
  resources: Resource[];
}

export interface Unit {
  id: string;
  index: number;
  title: string;
  summary: string;
  estimate: string; // e.g. "45 min approx."
  chapters: Chapter[];
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  /** lucide-react icon name */
  icon: string;
  accent: "primary" | "secondary" | "tertiary";
  streak: number;
  lastStudied: string;
  isNew?: boolean;
  units: Unit[];
}

let rid = 0;
const r = (
  label: string,
  title: string,
  source: string,
  type: ResourceType,
  duration: string,
  completed: boolean,
  preview: string
): Resource => ({
  id: `res-${rid++}`,
  label,
  title,
  source,
  type,
  duration,
  completed,
  preview,
});

export const mockJourneys: Journey[] = [
  {
    id: "systems-architecture",
    name: "Systems Architecture",
    description:
      "Advanced patterns for scalable distributed systems, microservices, and the trade-offs behind resilient infrastructure.",
    icon: "Boxes",
    accent: "primary",
    streak: 4,
    lastStudied: "Yesterday, 8:42 PM",
    units: [
      {
        id: "sa-u1",
        index: 1,
        title: "Distributed Systems Foundations",
        summary: "The core vocabulary: latency, partitioning, and failure modes.",
        estimate: "40 min approx.",
        chapters: [
          {
            id: "sa-u1-c1",
            title: "Why Distributed Systems Are Hard",
            aiOverview:
              "This chapter frames the eight fallacies of distributed computing and why naïve assumptions about the network cause cascading failures at scale.",
            resources: [
              r("1-1", "The Eight Fallacies of Distributed Computing", "Arch Weekly", "article", "12 min", true, "A short essay unpacking Peter Deutsch's classic list and modern equivalents."),
              r("1-2", "Latency Numbers Every Engineer Should Know", "Systems Digest", "reading", "8 min", true, "The famous latency ladder — L1 cache to cross-continent round trips."),
              r("1-3", "Failure Modes in Production", "SRE Talks", "video", "22 min", false, "A conference talk walking through real postmortems and their root causes."),
            ],
          },
          {
            id: "sa-u1-c2",
            title: "Partitioning & the CAP Theorem",
            aiOverview:
              "A pragmatic take on CAP: it's not a strict pick-two, but a spectrum of consistency guarantees you tune per operation.",
            resources: [
              r("1-4", "CAP Theorem, Revisited", "Distributed Notes", "article", "15 min", false, "Why 'CA' isn't a real option and what PACELC adds to the picture."),
              r("1-5", "Interactive Lab: Simulating Network Partitions", "METIS Labs", "lab", "30 min", false, "A sandbox that lets you sever links between nodes and watch the system react."),
            ],
          },
        ],
      },
      {
        id: "sa-u2",
        index: 2,
        title: "Scaling Patterns & Microservices",
        summary: "Decomposition strategies, service boundaries, and communication patterns.",
        estimate: "55 min approx.",
        chapters: [
          {
            id: "sa-u2-c1",
            title: "Monolith to Services",
            aiOverview:
              "Decomposition is a socio-technical problem. This chapter covers the strangler-fig pattern and how to draw service boundaries around business capabilities.",
            resources: [
              r("2-1", "The Strangler Fig Migration Pattern", "Refactoring Guild", "article", "14 min", false, "Incrementally replacing a monolith without a big-bang rewrite."),
              r("2-2", "Domain-Driven Boundaries", "DDD Weekly", "video", "26 min", false, "Using bounded contexts to decide what belongs in which service."),
              r("2-3", "Quiz: Spot the Bad Boundary", "METIS Labs", "quiz", "10 min", false, "Five scenarios where the service split leaks abstractions."),
            ],
          },
          {
            id: "sa-u2-c2",
            title: "Synchronous vs. Event-Driven",
            aiOverview:
              "When to use request/response and when to reach for a message bus — plus the consistency costs of going async.",
            resources: [
              r("2-4", "Choreography vs. Orchestration", "Event Patterns", "article", "18 min", false, "Two ways to coordinate a multi-service workflow, with trade-offs."),
              r("2-5", "Interactive Lab: Building a Saga", "METIS Labs", "lab", "35 min", false, "Implement a distributed transaction with compensating actions."),
            ],
          },
        ],
      },
      {
        id: "sa-u3",
        index: 3,
        title: "Data Consistency & Consensus",
        summary: "Replication, quorums, and the algorithms that keep nodes in agreement.",
        estimate: "50 min approx.",
        chapters: [
          {
            id: "sa-u3-c1",
            title: "Consensus with Raft",
            aiOverview:
              "Raft was designed to be understandable. This chapter breaks leader election and log replication into digestible steps.",
            resources: [
              r("3-1", "The Raft Paper, Annotated", "Papers We Love", "reading", "40 min", false, "The original Raft paper with margin notes for first-time readers."),
              r("3-2", "Visualizing Raft", "Interactive CS", "video", "16 min", false, "An animated walkthrough of elections, splits, and recovery."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cognitive-psychology",
    name: "Cognitive Psychology",
    description:
      "Exploring memory formation, decision-making biases, and the mechanics of perception and attention.",
    icon: "Brain",
    accent: "secondary",
    streak: 12,
    lastStudied: "Today, 9:15 AM",
    units: [
      {
        id: "cp-u1",
        index: 1,
        title: "Memory Formation",
        summary: "Encoding, consolidation, and why we forget.",
        estimate: "35 min approx.",
        chapters: [
          {
            id: "cp-u1-c1",
            title: "Working Memory & Encoding",
            aiOverview:
              "Working memory is a narrow bottleneck. This chapter covers chunking, the phonological loop, and why interruptions are so costly.",
            resources: [
              r("1-1", "The Magical Number Seven", "Classic Papers", "reading", "25 min", true, "Miller's foundational paper on the limits of short-term memory."),
              r("1-2", "How Chunking Expands Capacity", "Mind Matters", "video", "14 min", true, "A demonstration of expert chunking in chess and digit spans."),
            ],
          },
          {
            id: "cp-u1-c2",
            title: "Consolidation & Forgetting",
            aiOverview:
              "Memories are rebuilt, not replayed. Spaced repetition and sleep both play a role in what survives.",
            resources: [
              r("1-3", "The Forgetting Curve", "Learning Science", "article", "10 min", true, "Ebbinghaus and the exponential decay of unrehearsed memory."),
              r("1-4", "Spaced Repetition in Practice", "Study Lab", "lab", "20 min", false, "Schedule a set of flashcards and watch the review intervals grow."),
            ],
          },
        ],
      },
      {
        id: "cp-u2",
        index: 2,
        title: "Decision-Making & Bias",
        summary: "Heuristics, framing effects, and dual-process theory.",
        estimate: "45 min approx.",
        chapters: [
          {
            id: "cp-u2-c1",
            title: "System 1 and System 2",
            aiOverview:
              "Kahneman's two modes of thought and how the fast system's shortcuts produce predictable errors.",
            resources: [
              r("2-1", "Thinking, Fast and Slow — Overview", "Book Notes", "reading", "30 min", true, "A condensed tour of the book's central framework."),
              r("2-2", "Anchoring & Adjustment", "Bias Files", "video", "12 min", false, "Why the first number you hear drags your estimate toward it."),
              r("2-3", "Quiz: Name That Bias", "METIS Labs", "quiz", "8 min", false, "Ten everyday scenarios — identify the cognitive bias at play."),
            ],
          },
        ],
      },
      {
        id: "cp-u3",
        index: 3,
        title: "Perception & Attention",
        summary: "How the brain filters, prioritizes, and sometimes fabricates reality.",
        estimate: "30 min approx.",
        chapters: [
          {
            id: "cp-u3-c1",
            title: "Selective Attention",
            aiOverview:
              "Attention is a spotlight with a cost. This chapter covers inattentional blindness and the cocktail-party effect.",
            resources: [
              r("3-1", "The Invisible Gorilla", "Perception Lab", "video", "9 min", false, "The classic experiment on how focus makes us miss the obvious."),
              r("3-2", "Change Blindness Explained", "Mind Matters", "article", "11 min", false, "Why large scene changes slip past us between glances."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "design-systems-2",
    name: "Design Systems 2.0",
    description:
      "Constructing tokens, building component libraries, and scaling a shared design language across teams.",
    icon: "PenTool",
    accent: "tertiary",
    streak: 1,
    lastStudied: "3 days ago",
    isNew: true,
    units: [
      {
        id: "ds-u1",
        index: 1,
        title: "Design Tokens",
        summary: "The single source of truth for color, type, and spacing.",
        estimate: "30 min approx.",
        chapters: [
          {
            id: "ds-u1-c1",
            title: "What Tokens Actually Are",
            aiOverview:
              "Tokens are named decisions. This chapter separates primitive, semantic, and component tokens and shows why the layering matters.",
            resources: [
              r("1-1", "A Theory of Design Tokens", "Design Ops", "article", "13 min", false, "Primitive vs. semantic vs. component tokens, with examples."),
              r("1-2", "Naming Tokens Without Regret", "Systems Studio", "video", "18 min", false, "A naming convention that survives rebrands and dark mode."),
            ],
          },
        ],
      },
      {
        id: "ds-u2",
        index: 2,
        title: "Component Libraries",
        summary: "APIs, variants, and documentation that people actually use.",
        estimate: "40 min approx.",
        chapters: [
          {
            id: "ds-u2-c1",
            title: "Designing Component APIs",
            aiOverview:
              "A component's prop surface is a contract. This chapter covers variant modeling and the cost of one-off overrides.",
            resources: [
              r("2-1", "Variants, Slots, and Composition", "Systems Studio", "article", "16 min", false, "How to model flexibility without exploding your prop list."),
              r("2-2", "Interactive Lab: Build a Button API", "METIS Labs", "lab", "28 min", false, "Design a button's variants and states, then stress-test the API."),
            ],
          },
        ],
      },
    ],
  },
];

/** Sum of completed resources / total, as a 0-100 integer. */
export function journeyProgress(journey: Journey): number {
  const all = journey.units.flatMap((u) => u.chapters.flatMap((c) => c.resources));
  if (all.length === 0) return 0;
  const done = all.filter((res) => res.completed).length;
  return Math.round((done / all.length) * 100);
}

export function unitProgress(unit: Unit): number {
  const all = unit.chapters.flatMap((c) => c.resources);
  if (all.length === 0) return 0;
  const done = all.filter((res) => res.completed).length;
  return Math.round((done / all.length) * 100);
}

export function unitResourceCount(unit: Unit): number {
  return unit.chapters.reduce((n, c) => n + c.resources.length, 0);
}

export interface JourneyCreationInput {
  goal: string;
  currentLevel: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: string;
  preferences: string;
}

/**
 * Produce a freshly "generated" mock journey from the creation form.
 * In Phase 2 this becomes a real AI roadmap-generation call.
 */
export function createMockJourney(input: JourneyCreationInput): Journey {
  const name = input.goal.trim() ? input.goal.trim() : "New Learning Journey";
  const id = `journey-${Date.now()}`;
  return {
    id,
    name,
    description:
      input.preferences.trim() ||
      `A personalized roadmap generated from your goal. Starting level: ${
        input.currentLevel.trim() || "not specified"
      }.`,
    icon: "Sparkles",
    accent: "primary",
    streak: 0,
    lastStudied: "Just now",
    isNew: true,
    units: [
      {
        id: `${id}-u1`,
        index: 1,
        title: "Foundations & Orientation",
        summary: "Get oriented and build the mental model you'll hang everything else on.",
        estimate: "35 min approx.",
        chapters: [
          {
            id: `${id}-u1-c1`,
            title: "The Lay of the Land",
            aiOverview:
              "METIS generated this overview from your goal. In Phase 2 it will be tailored to your stated level and preferences.",
            resources: [
              r("1-1", "Start Here: Your Roadmap Overview", "METIS", "reading", "8 min", false, "A generated primer on what you'll cover and why, in what order."),
              r("1-2", "Core Concepts, Visualized", "METIS", "video", "16 min", false, "A placeholder curated video introducing the fundamentals."),
              r("1-3", "Interactive Lab: First Steps", "METIS Labs", "lab", "25 min", false, "A hands-on sandbox to try the basics immediately."),
            ],
          },
        ],
      },
      {
        id: `${id}-u2`,
        index: 2,
        title: "Building Real Skills",
        summary: "Move from concepts to practice with guided exercises.",
        estimate: "50 min approx.",
        chapters: [
          {
            id: `${id}-u2-c1`,
            title: "Applied Practice",
            aiOverview:
              "A placeholder chapter. The real curriculum will adapt as you check off resources and chat with your tutor.",
            resources: [
              r("2-1", "Deep Dive: Key Techniques", "METIS", "article", "20 min", false, "A generated deep-dive on the techniques that matter most."),
              r("2-2", "Quiz: Check Your Understanding", "METIS Labs", "quiz", "10 min", false, "A short self-assessment to confirm the concepts landed."),
            ],
          },
        ],
      },
    ],
  };
}
