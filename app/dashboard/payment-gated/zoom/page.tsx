'use client';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

import CustomClerkPricing from '@/components/CustomClerkPricing';
import ErrorBoundary from '@/components/ErrorBoundary';
import BasicSchedule from '@/components/zoom/BasicSchedule';
import ZoomDashboard from '@/components/zoom/ZoomDashboard';
import { resolveAccessState } from '@/lib/subscription';

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
    try {
      if (!user) return false;

      const publicMetadata = (user.publicMetadata ?? {}) as Record<string, unknown>;
      const plan = typeof publicMetadata.plan === 'string' ? publicMetadata.plan : undefined;

      return resolveAccessState({
        plan,
        trialEndsAt: publicMetadata.trialEndsAt,
        memberships: user.organizationMemberships,
      }).hasAccess;
    } catch (error) {
      console.error('Error checking user access:', error);
      return false; // Default to no access on error
    }
  }, [user]);

  if (!isSignedIn) return null;

  return hasAccess ? (
    <ErrorBoundary>
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Aula en Vivo (Zoom)</h1>
        </div>
        <ZoomDashboard />
      </div>
    </ErrorBoundary>
  ) : (
    <ErrorBoundary>
      <UpgradeCard />
    </ErrorBoundary>
  );
}
