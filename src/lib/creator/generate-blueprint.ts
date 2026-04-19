import type { CreatorBlueprint, CreatorAgentRole } from "./types";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "our",
  "using",
  "into",
  "over",
  "under",
  "their",
  "they",
  "who",
  "will",
  "can",
  "has",
  "have",
  "was",
  "were",
  "been",
  "being",
  "about",
  "into",
  "than",
  "then",
  "when",
  "what",
  "which",
  "while",
  "where",
  "after",
  "before",
  "between",
  "through",
  "during",
  "without",
  "within",
  "across",
  "based",
  "using",
  "uses",
  "use",
  "also",
  "just",
  "like",
  "such",
  "each",
  "other",
  "more",
  "most",
  "some",
  "very",
  "only",
  "own",
  "same",
  "both",
  "few",
  "its",
  "any",
  "all",
  "not",
  "but",
  "how",
  "why",
  "way",
  "make",
  "made",
  "help",
  "helps",
  "want",
  "need",
  "needs",
  "gets",
  "get",
  "one",
  "two",
  "new",
  "first",
  "next",
  "last",
  "best",
  "fast",
  "easy",
  "free",
  "real",
  "time",
  "data",
  "app",
  "apps",
  "api",
  "via",
  "per",
  "day",
  "week",
  "year",
  "hour",
  "minutes",
  "minute",
  "seconds",
  "second",
  "users",
  "user",
  "home",
  "homes",
  "book",
  "books",
  "voice",
  "calendar",
  "agents",
  "agent",
  "business",
  "company",
  "companies",
  "launch",
  "launches",
]);

const SUFFIXES = [
  "Pulse",
  "Forge",
  "Prism",
  "Atlas",
  "Nimbus",
  "Vertex",
  "Helix",
  "Axiom",
];

function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function titleCase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function pickAgents(keywords: string[]): CreatorAgentRole[] {
  const k = keywords.join(" ");
  const has = (re: RegExp) => re.test(k);

  const marketingFocus = has(/market|brand|content|seo|social|growth|ad/)
    ? "Owns narrative, paid social, and lifecycle email around your wedge."
    : "Builds the story arc, landing experiments, and founder-led content engine.";

  const salesFocus = has(/sale|revenue|deal|crm|pipeline|b2b|enterprise/)
    ? "Runs outbound sequences, CRM hygiene, and deal desk for qualified leads."
    : "Designs self-serve plus sales-assist motions with crisp qualification.";

  const productFocus = has(/engineer|code|build|api|platform|infra|ml|model/)
    ? "Ships agent graphs, eval harnesses, and reliability guardrails."
    : "Turns the idea into a shippable product slice with instrumentation.";

  const successFocus = has(/support|customer|onboard|concierge|success/)
    ? "Owns onboarding, health scores, and proactive rescue plays."
    : "Designs onboarding checklists, docs, and feedback loops for retention.";

  const opsFocus = has(/ops|legal|compliance|finance|billing|contract/)
    ? "Coordinates contracts, billing rails, and compliance checkpoints."
    : "Automates billing, vendor ops, and weekly operating reviews.";

  return [
    { name: "Marketing Agent", focus: marketingFocus },
    { name: "Sales Agent", focus: salesFocus },
    { name: "Product & Engineering Agent", focus: productFocus },
    { name: "Customer Success Agent", focus: successFocus },
    { name: "Ops & Finance Agent", focus: opsFocus },
  ];
}

function heuristicBlueprint(sentence: string): CreatorBlueprint {
  const trimmed = sentence.trim();
  const words = tokenize(trimmed);
  const seed = hashSeed(trimmed);
  const suffix = SUFFIXES[seed % SUFFIXES.length];
  const meaningful = words.filter((w) => w.length > 3).slice(0, 4);
  const stem =
    meaningful.length >= 2
      ? titleCase(meaningful.slice(0, 2).join(" "))
      : trimmed.length > 24
        ? titleCase(trimmed.slice(0, 22).trim() + "…")
        : titleCase(trimmed.slice(0, Math.min(trimmed.length, 28)));

  const businessName = `${stem} ${suffix}`;

  const description = `${businessName} is an AI-native operator built around your thesis: “${trimmed}”. Week one focuses on validating demand signals, wiring agent workflows, and shipping a revenue-adjacent experiment so momentum compounds from day zero.`;

  const low = 4_200 + (seed % 9_800);
  const high = low + 6_000 + (seed % 14_000);

  return {
    businessName,
    description,
    agentTeam: pickAgents(words),
    firstWeekRevenue: { low, high, currency: "USD" },
  };
}

type OpenAIJson = {
  businessName?: string;
  description?: string;
  agentTeam?: { name?: string; focus?: string }[];
  firstWeekRevenueLow?: number;
  firstWeekRevenueHigh?: number;
};

function normalizeOpenAI(parsed: OpenAIJson, sentence: string): CreatorBlueprint {
  const agents: CreatorAgentRole[] = (parsed.agentTeam ?? [])
    .filter((a) => a.name && a.focus)
    .map((a) => ({ name: String(a.name), focus: String(a.focus) }));

  const low = Number(parsed.firstWeekRevenueLow);
  const high = Number(parsed.firstWeekRevenueHigh);

  return {
    businessName:
      typeof parsed.businessName === "string" && parsed.businessName.trim()
        ? parsed.businessName.trim()
        : heuristicBlueprint(sentence).businessName,
    description:
      typeof parsed.description === "string" && parsed.description.trim()
        ? parsed.description.trim()
        : heuristicBlueprint(sentence).description,
    agentTeam:
      agents.length >= 3
        ? agents
        : heuristicBlueprint(sentence).agentTeam,
    firstWeekRevenue:
      Number.isFinite(low) &&
      Number.isFinite(high) &&
      high > low &&
      low >= 0
        ? { low: Math.round(low), high: Math.round(high), currency: "USD" }
        : heuristicBlueprint(sentence).firstWeekRevenue,
  };
}

async function generateWithOpenAI(sentence: string): Promise<CreatorBlueprint | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.85,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You invent concise venture blueprints from one-sentence ideas.
Return JSON only with this shape:
{"businessName":"string","description":"string (2 short paragraphs max)","agentTeam":[{"name":"string like Marketing Agent","focus":"string one sentence"}],"firstWeekRevenueLow":number,"firstWeekRevenueHigh":number}
firstWeekRevenueHigh must be greater than firstWeekRevenueLow; use realistic USD bands for a scrappy AI startup's first week (often low thousands to low tens of thousands).`,
        },
        { role: "user", content: sentence },
      ],
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OpenAIJson;
    return normalizeOpenAI(parsed, sentence);
  } catch {
    return null;
  }
}

export async function generateCreatorBlueprint(
  sentence: string
): Promise<CreatorBlueprint> {
  const ai = await generateWithOpenAI(sentence);
  if (ai) return ai;
  return heuristicBlueprint(sentence);
}
