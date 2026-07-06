"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTheory(id: string) {
  try {
    // Delete comments manually first to avoid foreign key constraints if cascade isn't fully applied
    await prisma.comment.deleteMany({
      where: { theoryId: id }
    });

    await prisma.theory.delete({
      where: { id }
    });

    revalidatePath("/admin/users/manage");
    revalidatePath("/"); // Revalidate home page as well
    return { success: true };
  } catch (err) {
    console.error("Failed to delete theory:", err);
    return { error: "Failed to delete theory" };
  }
}

export async function deleteComment(id: string) {
  try {
    // Check if it has replies and delete them first
    await prisma.comment.deleteMany({
      where: { parentId: id }
    });

    await prisma.comment.delete({
      where: { id }
    });

    revalidatePath("/admin/users/manage");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete comment:", err);
    return { error: "Failed to delete comment" };
  }
}
