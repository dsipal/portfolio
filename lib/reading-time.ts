const WORDS_PER_MINUTE = 225;

/** Estimated minutes to read a Markdown string (minimum 1) */
export function readingTime(markdown: string | null | undefined) {
  if (!markdown) return 1;
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ") // code blocks are skimmed, not read
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~\-[\]()!]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
