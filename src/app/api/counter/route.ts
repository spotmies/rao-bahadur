import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let stat = await prisma.globalStat.findUnique({
      where: { id: "counter" }
    });

    if (!stat) {
      stat = await prisma.globalStat.create({
        data: { id: "counter", count: 12438201 }
      });
    }

    return NextResponse.json({ count: stat.count });
  } catch (error) {
    console.error("Error fetching counter:", error);
    return NextResponse.json({ count: 12438201 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { count } = await request.json();

    if (typeof count !== 'number') {
      return NextResponse.json({ error: "Invalid count" }, { status: 400 });
    }

    const stat = await prisma.globalStat.upsert({
      where: { id: "counter" },
      update: { count },
      create: { id: "counter", count }
    });

    return NextResponse.json({ count: stat.count });
  } catch (error) {
    console.error("Error updating counter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
