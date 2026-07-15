"use server";

import { prisma } from "@/lib/prisma";

export async function submitDebateRegistration(formData: {
  fullName: string;
  age: string;
  contactNumber: string;
  email: string;
  likedFilm: string;
  likedReason: string;
  dislikedReason: string;
  inHyderabad: string;
  discussPart: string;
  okayFilmed: string;
  socialHandles: string;
}) {
  try {
    const registration = await prisma.debateRegistration.create({
      data: {
        ...formData,
        age: parseInt(formData.age, 10) || 0,
      },
    });

    return { success: true, id: registration.id };
  } catch (error) {
    console.error("Failed to submit debate registration:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function deleteDebateRegistration(id: string) {
  try {
    await prisma.debateRegistration.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete debate registration:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function bulkDeleteDebateRegistrations(ids: string[]) {
  try {
    await prisma.debateRegistration.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk delete debate registrations:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
