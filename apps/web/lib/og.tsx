import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared Open Graph card: dark background, brand glow, eyebrow + large title */
export function ogImage({
  eyebrow,
  title,
  footer,
}: {
  eyebrow?: string | null;
  title: string;
  footer: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 85% 10%, rgba(129,140,248,0.45), transparent 45%), radial-gradient(circle at 10% 90%, rgba(56,189,248,0.25), transparent 40%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#a5b4fc" }}>{eyebrow ?? ""}</div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 60 ? 56 : 72,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: -2,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>
        {footer}
        <span style={{ color: "#818cf8" }}>.</span>
      </div>
    </div>,
    ogSize,
  );
}

/** An uploaded image scaled to fill the Open Graph card; null when it can't be fetched */
export async function ogShareImage(url: string) {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !type.startsWith("image/")) throw new Error(`${response.status} ${type}`);
    const data = Buffer.from(await response.arrayBuffer()).toString("base64");
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#09090b" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={`data:${type};base64,${data}`} width={ogSize.width} height={ogSize.height} style={{ objectFit: "cover" }} />
      </div>,
      ogSize,
    );
  } catch (error) {
    console.error(`[og] share image ${url} failed:`, error);
    return null;
  }
}
