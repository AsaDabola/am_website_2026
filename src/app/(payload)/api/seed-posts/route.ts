import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";
import {
  convertMarkdownToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import importedPosts from "@/data/imported-posts.json";

type ImportedPost = {
  title: string;
  slug: string;
  category: "news" | "editorial" | "photo-news" | "testimony";
  publishedDate: string;
  excerpt: string;
  body: string;
};

// One-time import of ~400 articles carried over from the old amintl.org site
// (parsed from a Notion export of the old News collection). Batched via
// offset/limit so a single call can't time out a serverless function —
// call repeatedly, passing the returned nextOffset, until done: true.
// Requires a logged-in admin session. Delete this route once imported.
export async function POST(request: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "40");

  const posts = importedPosts as ImportedPost[];
  const batch = posts.slice(offset, offset + limit);

  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config);

  const created: string[] = [];
  const skipped: string[] = [];

  for (const post of batch) {
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: post.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      skipped.push(post.slug);
      continue;
    }

    const body = convertMarkdownToLexical({ editorConfig, markdown: post.body });

    await payload.create({
      collection: "posts",
      data: {
        title: post.title,
        slug: post.slug,
        category: post.category,
        publishedDate: post.publishedDate,
        excerpt: post.excerpt,
        body,
      },
    });
    created.push(post.slug);
  }

  const nextOffset = offset + limit;
  const done = nextOffset >= posts.length;

  return NextResponse.json({
    ok: true,
    total: posts.length,
    processed: offset + batch.length,
    created: created.length,
    skipped: skipped.length,
    nextOffset: done ? null : nextOffset,
    done,
  });
}
