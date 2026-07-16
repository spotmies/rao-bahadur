import { prisma } from "@/lib/prisma";
import DebateDataDashboard from "./DebateDataDashboard";
import { getDebateStatus } from "@/app/debate/actions";

export const dynamic = "force-dynamic";

export default async function AdminDebateDataPage() {
  const registrations = await prisma.debateRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  const isDebateActive = await getDebateStatus();

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <DebateDataDashboard initialRegistrations={registrations} initialIsActive={isDebateActive} />
    </main>
  );
}
