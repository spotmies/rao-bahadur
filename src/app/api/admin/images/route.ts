import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const whereClause = category ? { category } : {};

    const images = await prisma.dynamicImage.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const count = await prisma.dynamicImage.count({
      where: { category: data.category }
    });
    
    const image = await prisma.dynamicImage.create({
      data: {
        category: data.category,
        src: data.src,
        order: count, // Add to the end
      }
    });
    return NextResponse.json(image);
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Check if it's a reorder operation
    if (data.reorder && Array.isArray(data.items)) {
      // items is an array of { id, order }
      const updates = data.items.map((item: any) => 
        prisma.dynamicImage.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      );
      await prisma.$transaction(updates);
      return NextResponse.json({ success: true });
    }
    
    // Otherwise it's a normal update
    const { id, ...updateData } = data;
    const image = await prisma.dynamicImage.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(image);
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    
    await prisma.dynamicImage.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
