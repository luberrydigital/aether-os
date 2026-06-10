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
  "sell",
  "shop",
  "store",
  "online",
  "make",
  "build",
]);

export function slugifyStoreSlug(input: string): string {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "store";
}

export function defaultSlugFromSentence(sentence: string): string {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
  const stem = words.slice(0, 3).join("-");
  return slugifyStoreSlug(stem || "ai-store");
}
