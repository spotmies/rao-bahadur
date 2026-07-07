import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let stat = await prisma.globalStat.findUnique({
      where: { id: "view_counter" }
    });

    if (!stat) {
      stat = await prisma.globalStat.create({
        data: { id: "view_counter", count: 51347 }
      });
    }

    return NextResponse.json({ count: stat.count });
  } catch (error) {
    console.error("Error fetching counter:", error);
    return NextResponse.json({ count: 51347 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const stat = await prisma.globalStat.upsert({
      where: { id: "view_counter" },
      update: { count: { increment: 1 } },
      create: { id: "view_counter", count: 51347 }
    });

    return NextResponse.json({ count: stat.count });
  } catch (error) {
    console.error("Error updating counter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
