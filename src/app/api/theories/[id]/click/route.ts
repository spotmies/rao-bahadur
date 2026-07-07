import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing theory ID" }, { status: 400 });
    }

    const theory = await prisma.theory.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true, clicks: theory.clicks });
  } catch (error) {
    console.error("Error incrementing click:", error);
    return NextResponse.json({ error: "Failed to increment click" }, { status: 500 });
  }
}
