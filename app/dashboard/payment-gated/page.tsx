'use client';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

import CustomClerkPricing from '@/components/CustomClerkPricing';
import { resolveAccessState } from '@/lib/subscription';

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

    const publicMetadata = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const plan = typeof publicMetadata.plan === 'string' ? publicMetadata.plan : undefined;

    return resolveAccessState({
      plan,
      trialEndsAt: publicMetadata.trialEndsAt,
      memberships: user.organizationMemberships,
    }).hasAccess;
  }, [user]);

  if (!isSignedIn) return null;
  return hasAccess ? <FeaturesCard /> : <upgradecard />;hasAccess<FeaturesCard
}
