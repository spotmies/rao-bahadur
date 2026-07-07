import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "trending";
  const id = searchParams.get("id");

  try {
    const top5Theories = await prisma.theory.findMany({
      orderBy: { clicks: 'desc' },
      take: 5,
      select: { id: true }
    });
    const top5Ids = new Set(top5Theories.map(t => t.id));

    if (id) {
      const theory = await prisma.theory.findUnique({
        where: { id },
        include: { _count: { select: { comments: true } } }
      });
      if (!theory) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({
        id: theory.id,
        title: theory.title,
        content: theory.content,
        author: theory.author,
        tag: theory.tag,
        isTrending: top5Ids.has(theory.id),
        upvotes: theory.upvotes,
        clicks: theory.clicks,
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
      content: t.content,
      author: t.author,
      tag: t.tag,
      isTrending: top5Ids.has(t.id),
      upvotes: t.upvotes,
      clicks: t.clicks,
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
    const { title, content, author, tag } = body;

    if (!title || !author) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const newTheory = await prisma.theory.create({
      data: {
        title,
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
