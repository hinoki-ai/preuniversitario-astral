'use client';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

import CustomClerkPricing from '@/components/custom-clerk-pricing';
import BasicSchedule from '@/components/zoom/BasicSchedule';
import ZoomDashboard from '@/components/zoom/ZoomDashboard';

function UpgradeCard() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-center text-2xl font-semibold lg:text-3xl">
          Conviértete en Estudiante Iluminado
        </h1>
        <p>
          El aula de Zoom está disponible para estudiantes iluminados. Puedes ver la agenda básica a
          continuación.
        </p>
      </div>
      <div className="px-4 lg:px-12 max-w-3xl mx-auto">
        <div className="rounded-lg border bg-card p-6 space-y-4 mb-6">
          <div className="text-left">
            <div className="text-base font-semibold">Próximas clases</div>
            <div className="text-sm text-muted-foreground">
              La información de acceso se desbloquea al actualizar tu plan.
            </div>
          </div>
          <BasicSchedule />
        </div>
        <CustomClerkPricing />
      </div>
    </>
  );
}

export default function ZoomPaidPage() {
  const { user, isSignedIn } = useUser();
  const hasAccess = useMemo(() => {
    if (!user) return false;
    const paidPlans = (process.env.NEXT_PUBLIC_CLERK_PAID_PLANS || '')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    const plan = (user.publicMetadata as any)?.plan as string | undefined;
    const trialRaw = (user.publicMetadata as any)?.trialEndsAt as any;
    let trialEndsAt: number | undefined;
    if (typeof trialRaw === 'number') trialEndsAt = trialRaw;
    else if (typeof trialRaw === 'string') {
      const n = Number(trialRaw);
      if (!Number.isNaN(n) && n > 1000000000) trialEndsAt = n;
      else {
        const d = new Date(trialRaw);
        if (!isNaN(d.getTime())) trialEndsAt = Math.floor(d.getTime() / 1000);
      }
    }
    const now = Math.floor(Date.now() / 1000);
    const isPaidPlan = (p?: string | null) => {
      if (!p) return false;
      if (p === 'free_user') return false;
      if (p === 'trial_user') return false;
      return paidPlans.length > 0 ? paidPlans.includes(p) : true;
    };
    if (isPaidPlan(plan)) return true;
    const orgPaid = (user.organizationMemberships || []).some((m: any) =>
      isPaidPlan((m.organization.publicMetadata as any)?.plan)
    );
    if (orgPaid) return true;
    return plan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > now;
  }, [user]);
  if (!isSignedIn) return null;
  return hasAccess ? (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aula en Vivo (Zoom)</h1>
      </div>
      <ZoomDashboard />
    </div>
  ) : (
    <UpgradeCard />
  );
}
