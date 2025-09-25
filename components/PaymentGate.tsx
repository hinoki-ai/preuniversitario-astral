'use client';

import { useUser } from '@clerk/nextjs';
import { useMemo, ReactNode, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, Star, Crown } from 'lucide-react';
import { resolveAccessState } from '@/lib/subscription';

interface paymentgateprops {
  children: reactnode;
  feature: string;
  description?: string;
  premiumFeatures?: string[];
  showPreview?: boolean;
}

export function PaymentGate({
  children,
  feature,
  description,
  premiumFeatures,
  showPreview = false
}: PaymentGateProps) {
  const { user, isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <Card className="p-8 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Inicia Sesión Requerido</h3>
        <p className="text-muted-foreground mb-4">
          Debes iniciar sesión para acceder a {feature}.
        </p>
        <Button asChild>
          <a href="/sign-in">Iniciar Sesión</a>
        </Button>
      </Card>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      {showPreview && (
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Card className="w-full max-w-md p-6 text-center shadow-lg">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Vista Previa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conviértete en Estudiante Iluminado para acceso completo
              </p>
              <Button size="sm" asChild>
                <a href="/dashboard/payment-gated">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade Ahora
                </a>
              </Button>
            </Card>
          </div>
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
        </div>
      )}
      
      <Card className="p-8 text-center border-2 border-dashed border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Badge variant="secondary" className="px-3 py-1 mb-2">
              <Star className="h-4 w-4 mr-1" />
              Estudiante Iluminado
            </Badge>
          </div>
          
          <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold mb-2 text-yellow-700 dark:text-yellow-300">
            {feature}
          </h2>
          
          {description && (
            <p className="text-muted-foreground mb-6">
              {description}
            </p>
          )}

          {premiumFeatures && (
            <div className="mb-6 text-left">
              <h4 className="font-semibold mb-3 text-center">Características Premium:</h4>
              <ul className="space-y-2 text-sm">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <Button size="lg" className="w-full" asChild>
              <a href="/dashboard/payment-gated">
                <Crown className="h-5 w-5 mr-2" />
                Conviértete en Estudiante Iluminado
              </a>
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Acceso completo a todas las herramientas premium del preuniversitario
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}