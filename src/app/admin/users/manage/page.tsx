import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

// Next.js config to ensure the page doesn't try to statically cache dynamic data
export const dynamic = "force-dynamic";

export default async function AdminManageUsersPage() {
  const theories = await prisma.theory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  });

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      theory: {
        select: { title: true }
      }
    }
  });

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <AdminDashboard initialTheories={theories} initialComments={comments} />
    </main>
  );
}
