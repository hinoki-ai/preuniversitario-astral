'use client';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

import CustomClerkPricing from '@/components/custom-clerk-pricing';

function UpgradeCard() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-center text-2xl font-semibold lg:text-3xl">
          Conviértete en Estudiante Iluminado
        </h1>
        <p>
          Esta página está disponible para estudiantes iluminados. Elige un plan que se ajuste a tus
          necesidades.
        </p>
      </div>
      <div className="px-8 lg:px-12">
        <CustomClerkPricing />
      </div>
    </>
  );
}

function FeaturesCard() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Características para Estudiantes Iluminados</h1>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Página con herramientas avanzadas</h2>
          <p className="text-muted-foreground">
            Acceso completo a todas las características avanzadas del centro preuniversitario.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentGatedPage() {
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
    // org precedence
    const orgPaid = (user.organizationMemberships || []).some((m: any) =>
      isPaidPlan((m.organization.publicMetadata as any)?.plan)
    );
    if (orgPaid) return true;
    // active trial
    return plan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > now;
  }, [user]);

  if (!isSignedIn) return null;
  return hasAccess ? <FeaturesCard /> : <UpgradeCard />;
}
