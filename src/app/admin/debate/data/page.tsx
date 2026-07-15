import { prisma } from "@/lib/prisma";
import DebateDataDashboard from "./DebateDataDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDebateDataPage() {
  const registrations = await prisma.debateRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <DebateDataDashboard initialRegistrations={registrations} />
    </main>
  );
}
