import { NextResponse } from "next/server";

function cleanText(value?: string) {
  return (value || "")
    .replace("<![CDATA[", "")
    .replace("]]>", "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return cleanText(match?.[1]);
}

export async function GET() {
  try {
    const url =
      "https://news.google.com/rss/search?q=Copa%20do%20Mundo%202026%20FIFA&hl=pt-BR&gl=BR&ceid=BR:pt-419";

    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    const xml = await response.text();
    const items = xml.split("<item>").slice(1, 9);

    const news = items.map((item) => ({
      title: getTag(item, "title"),
      link: getTag(item, "link"),
      pubDate: getTag(item, "pubDate"),
      source: getTag(item, "source"),
    }));

    return NextResponse.json({ news });
  } catch {
    return NextResponse.json({ news: [] });
  }
}
