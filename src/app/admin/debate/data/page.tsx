import { prisma } from "@/lib/prisma";
import DebateDataDashboard from "./DebateDataDashboard";
import { getAdminDebateStatus } from "@/app/debate/actions";

export const dynamic = "force-dynamic";

export default async function AdminDebateDataPage() {
  const registrations = await prisma.debateRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  const adminStatus = await getAdminDebateStatus();

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <DebateDataDashboard 
        initialRegistrations={registrations} 
        initialIsActive={adminStatus.isActive} 
        initialClosingAt={adminStatus.closingAt} 
      />
    </main>
  );
}
