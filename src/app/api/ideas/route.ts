import { NextResponse } from "next/server";
import { z } from "zod";
import { generateLlmJson } from "@/lib/llm/chat-model";

export const runtime = "nodejs";

const schema = z.object({
  market: z.string().min(2).max(80).default("South Africa"),
  count: z.number().int().min(3).max(20).default(10),
});

type Idea = { title: string; whyNow: string; firstOffer: string; firstChannel: string };

function fallbackIdeas(market: string, count: number): Idea[] {
  const base: Idea[] = [
    {
      title: "AI merch drops (local culture edition)",
      whyNow: "Short-form + meme cycles move product faster than traditional brands.",
      firstOffer: "Limited drop: tees + hoodies + stickers",
      firstChannel: "TikTok + Instagram Reels + WhatsApp broadcast",
    },
    {
      title: "Teen fitness clothing brand",
      whyNow: "Fitness identity content is exploding; teens buy belonging.",
      firstOffer: "Starter bundle: top + leggings / shorts (bundle discount)",
      firstChannel: "TikTok creators + campus micro-influencers",
    },
    {
      title: "AI study kits for matric students",
      whyNow: "Exam cycles are predictable; parents pay for clarity and structure.",
      firstOffer: "Subject pack PDF + tutor prompts + weekly plan",
      firstChannel: "Facebook groups + TikTok explainers",
    },
    {
      title: "Small business invoice + WhatsApp automation",
      whyNow: "SMEs run on WhatsApp; saving time is immediate ROI.",
      firstOffer: "R199/mo automation template + setup",
      firstChannel: "Local business communities + referrals",
    },
    {
      title: "Beauty product sampling storefront",
      whyNow: "Discovery sells; sampling reduces risk for first purchase.",
      firstOffer: "Sample bundle + upsell full size",
      firstChannel: "Instagram + influencer bundles",
    },
  ];

  const out: Idea[] = [];
  for (let i = 0; i < count; i += 1) {
    const pick = base[i % base.length]!;
    out.push({ ...pick, title: `${pick.title} — ${market}` });
  }
  return out;
}

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { market, count } = parsed.data;

  const ideas = await generateLlmJson<{ ideas: Idea[] }>(
    [
      {
        role: "system",
        content:
          "You are an elite startup operator. Return strict JSON only. No markdown. No extra keys.",
      },
      {
        role: "user",
        content:
          `Generate ${count} business ideas for the market: ${market}.\n` +
          "Each idea must be realistically launchable tonight.\n" +
          "Return JSON: {\"ideas\":[{\"title\":\"...\",\"whyNow\":\"...\",\"firstOffer\":\"...\",\"firstChannel\":\"...\"}]}",
      },
    ],
    () => ({ ideas: fallbackIdeas(market, count) })
  );

  return NextResponse.json({ ideas: Array.isArray(ideas.ideas) ? ideas.ideas.slice(0, count) : fallbackIdeas(market, count) });
}

