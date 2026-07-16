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
    const isActive = await getDebateStatus();
    if (!isActive) {
      return { success: false, error: "Registrations are currently closed." };
    }

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

export async function getDebateStatus() {
  try {
    const setting = await prisma.debateSetting.findUnique({
      where: { id: "settings" },
    }) as { isActive: boolean, closingAt: Date | null } | null;
    if (!setting) return true;
    if (!setting.isActive) return false;
    if (setting.closingAt && setting.closingAt.getTime() <= Date.now()) {
      return false; // Grace period ended
    }
    return true;
  } catch (error) {
    console.error("Failed to get debate status:", error);
    return true; // Default to true if not found
  }
}

export async function getAdminDebateStatus(): Promise<{ isActive: boolean, closingAt: Date | null }> {
  try {
    const setting = await prisma.debateSetting.findUnique({
      where: { id: "settings" },
    }) as { isActive: boolean, closingAt: Date | null } | null;
    return setting || { isActive: true, closingAt: null };
  } catch (error) {
    return { isActive: true, closingAt: null };
  }
}

export async function toggleDebateStatus(isActive: boolean, useGracePeriod: boolean = false) {
  try {
    const updateData: any = { isActive, closingAt: null };
    
    if (useGracePeriod) {
      updateData.isActive = true; // Still active during grace period
      updateData.closingAt = new Date(Date.now() + 5 * 60 * 1000);
    } else if (!isActive) {
      updateData.closingAt = null; // Close immediately
    }

    await prisma.debateSetting.upsert({
      where: { id: "settings" },
      update: updateData,
      create: { id: "settings", ...updateData },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle debate status:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
