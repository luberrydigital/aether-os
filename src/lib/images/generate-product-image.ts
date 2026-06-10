const PLACEHOLDER_PATH = "/placeholder-product.svg";

async function openAiGenerateImageUrl(prompt: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `${prompt}\n\nStyle: premium ecommerce product photo, clean background, no text, no watermark, no logos.`,
      size: "1024x1024",
      n: 1,
      response_format: "url",
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.warn("OpenAI image generation failed:", res.status, raw.slice(0, 300));
    return null;
  }
  try {
    const data = JSON.parse(raw) as {
      data?: { url?: string }[];
    };
    const url = data.data?.[0]?.url;
    return typeof url === "string" && url.startsWith("http") ? url : null;
  } catch {
    return null;
  }
}

/**
 * Generates a product image (OpenAI DALL·E when configured) and stores it in Supabase Storage when possible.
 * Falls back to a local placeholder asset so storefronts always render.
 */
export async function generateAndStoreProductImage(opts: {
  prompt: string;
}): Promise<string> {
  const remote = await openAiGenerateImageUrl(opts.prompt);
  if (!remote) return PLACEHOLDER_PATH;
  // Supabase storage removed. For MVP we return the remote URL directly.
  return remote;
}
