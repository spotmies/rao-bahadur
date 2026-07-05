import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "trending";
  const id = searchParams.get("id");

  try {
    if (id) {
      const theory = await prisma.theory.findUnique({
        where: { id },
        include: { _count: { select: { comments: true } } }
      });
      if (!theory) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({
        id: theory.id,
        title: theory.title,
        excerpt: theory.excerpt,
        content: theory.content,
        author: theory.author,
        tag: theory.tag,
        upvotes: theory.upvotes,
        comments: theory._count.comments,
        createdAt: theory.createdAt.toISOString()
      });
    }

    const theories = await prisma.theory.findMany({
      include: {
        _count: {
          select: { comments: true }
        }
      },
      orderBy: sort === "trending" ? { upvotes: 'desc' } : { createdAt: 'desc' }
    });

    // Format for client
    const formatted = theories.map((t: any) => ({
      id: t.id,
      title: t.title,
      excerpt: t.excerpt,
      content: t.content,
      author: t.author,
      tag: t.tag,
      upvotes: t.upvotes,
      comments: t._count.comments,
      createdAt: t.createdAt.toISOString()
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch theories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, excerpt, content, author, tag } = body;

    if (!title || !author) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const newTheory = await prisma.theory.create({
      data: {
        title,
        excerpt: excerpt || title.substring(0, 50) + "...",
        content,
        author,
        tag: tag || "Hidden Detail"
      }
    });

    return NextResponse.json({ ...newTheory, comments: 0 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create theory" }, { status: 500 });
  }
}
