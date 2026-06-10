import { generateLlmJson } from "@/lib/llm/chat-model";

export type ContentType = "social" | "email" | "product";

export type GeneratedContent = {
  type: ContentType;
  items: string[];
  subject?: string;
  preview?: string;
};

function fallbackSocial(businessName: string, context: string): GeneratedContent {
  const name = businessName || "your brand";
  return {
    type: "social",
    items: [
      `🚀 ${name} just changed the game. ${context.slice(0, 120)} — and we're only getting started. Link in bio.`,
      `Stop scrolling. ${name} is solving ${context.slice(0, 80)} for founders who refuse to wait. Try it free today.`,
      `Built different. ${name} runs 24/7 so you don't have to. ${context.slice(0, 100)} #AIbusiness #entrepreneur`,
      `POV: You launched an AI business in one sentence and revenue started flowing. That's ${name}. Start now →`,
      `We tested 47 approaches. ${name} won. ${context.slice(0, 90)} — results speak louder than hype.`,
    ],
  };
}

function fallbackEmail(businessName: string, context: string): GeneratedContent {
  const name = businessName || "your brand";
  return {
    type: "email",
    subject: `${name}: Your AI business is ready to earn`,
    preview: "A 5-email sequence designed to convert curious visitors into paying customers.",
    items: [
      `Email 1 — Welcome\n\nSubject: Welcome to ${name}\n\nHi {{first_name}},\n\nYou just took the smartest step an entrepreneur can take — letting AI build your business while you focus on growth.\n\n${context}\n\nYour dashboard is live. Log in and watch your agents work.\n\n— The ${name} Team`,
      `Email 2 — Value\n\nSubject: Here's what ${name} does while you sleep\n\nHi {{first_name}},\n\nLast night your AI agents:\n• Generated fresh marketing copy\n• Optimised your product listings\n• Prepared outreach sequences\n\nThis is what 24/7 automation feels like.\n\n— The ${name} Team`,
      `Email 3 — Social proof\n\nSubject: Founders like you are already earning\n\nHi {{first_name}},\n\nOperators across South Africa are using ${name} to launch revenue-generating businesses in minutes — not months.\n\n${context.slice(0, 150)}\n\nYour turn.\n\n— The ${name} Team`,
      `Email 4 — Urgency\n\nSubject: Your competitors aren't waiting\n\nHi {{first_name}},\n\nEvery day without an AI-powered business is revenue left on the table.\n\n${name} gives you agents, storefronts, and payment rails in one platform.\n\nUpgrade to Pro and unlock unlimited launches.\n\n— The ${name} Team`,
      `Email 5 — Final call\n\nSubject: Last chance to activate your AI empire\n\nHi {{first_name}},\n\nThis is your final reminder. ${name} is built for founders who move fast.\n\nStart earning today → [Activate Now]\n\n— The ${name} Team`,
    ],
  };
}

function fallbackProduct(businessName: string, context: string): GeneratedContent {
  const name = businessName || "Premium Product";
  return {
    type: "product",
    items: [
      `${name} — Engineered for Excellence\n\n${context}\n\nCrafted with precision and backed by AI-driven quality assurance. Every detail optimised for performance, durability, and customer satisfaction.\n\n✓ Premium materials\n✓ 30-day satisfaction guarantee\n✓ Fast nationwide delivery\n\nOrder now and experience the difference.`,
      `Short description: ${context.slice(0, 160)}`,
      `SEO title: ${name} | Premium AI-Built Product — Shop Now`,
      `Meta description: Discover ${name}. ${context.slice(0, 120)} Free shipping on orders over R500.`,
      `Bullet points:\n• ${context.slice(0, 60)}\n• Designed for modern entrepreneurs\n• Backed by Luberry AI quality standards\n• Ships within 2-3 business days`,
    ],
  };
}

const PROMPTS: Record<ContentType, string> = {
  social: `Generate 5 high-converting social media posts (LinkedIn, Twitter/X, Instagram). Each post should be distinct in tone. Return JSON: { "items": string[] }`,
  email: `Generate a 5-email welcome-to-conversion sequence. Return JSON: { "subject": string, "preview": string, "items": string[] } where each item is a full email with subject line.`,
  product: `Generate product marketing copy: full description, short description, SEO title, meta description, and bullet points. Return JSON: { "items": string[] } with 5 items.`,
};

export async function generateAgentContent(params: {
  type: ContentType;
  context: string;
  businessName?: string;
}): Promise<GeneratedContent> {
  const { type, context, businessName = "" } = params;
  const fallbacks = {
    social: () => fallbackSocial(businessName, context),
    email: () => fallbackEmail(businessName, context),
    product: () => fallbackProduct(businessName, context),
  };

  const result = await generateLlmJson<{ items: string[]; subject?: string; preview?: string }>(
    [
      {
        role: "system",
        content:
          "You are Luberry AI's elite marketing agent. Write persuasive, premium copy for South African and global entrepreneurs. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Business: ${businessName || "Unnamed business"}\nContext: ${context}\n\n${PROMPTS[type]}`,
      },
    ],
    fallbacks[type]
  );

  return { type, ...result };
}
