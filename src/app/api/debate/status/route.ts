import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.debateSetting.findUnique({
      where: { id: "settings" },
    });
    return NextResponse.json({ isActive: setting?.isActive ?? true });
  } catch (error) {
    console.error("Failed to fetch debate status:", error);
    return NextResponse.json({ isActive: true }, { status: 500 });
  }
}
