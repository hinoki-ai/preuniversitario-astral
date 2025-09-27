'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import {
  Award,
  Coins,
  Crown,
  Gem,
  Gift,
  Palette,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Stars,
  Trophy,
} from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  costMonedasDragon: number;
  costCristalesMagicos?: number;
  category: 'tema' | 'emblema' | 'potenciador' | 'utilidad';
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
}

interface UserRewards {
  monedasDragon?: number;
  cristalesMagicos?: number;
  emblemas?: Array<{ id: string; name: string }>;
  totalItemsUnlocked?: number;
}

export function RewardsShop() {
  const [selectedRarity, setSelectedRarity] = useState<'all' | RewardItem['rarity']>('all');
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);

  const userRewards = useQuery(api.rewardsSystem.getUserRewards) as UserRewards | undefined;
  const catalogItems = useQuery(api.rewardsSystem.getRewardsCatalog, {}) as unknown as RewardItem[] | undefined;
  const dailyRewardsData = useQuery(api.rewardsSystem.getDailyLoginRewards) as {
    upcomingRewards?: Array<{
      day: number;
      rewards: Array<{
        type: string;
        amount?: number;
      }>;
    }>;
    canClaimToday?: boolean;
    claimedToday?: boolean;
  } | undefined;

  const purchaseItem = useMutation(api.rewardsSystem.purchaseShopItem);
  const claimDailyReward = useMutation(api.rewardsSystem.claimDailyReward);

  const filteredCatalog = useMemo(() => {
    if (!catalogItems) return [];
    if (selectedRarity === 'all') return catalogItems;
    return catalogItems.filter(item => item.rarity === selectedRarity);
  }, [catalogItems, selectedRarity]);

  return (
    <div className="space-y-6">
      <CurrencyHeader userRewards={userRewards} />

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Mercado Místico
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recompensas Diarias
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Colección Legendaria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">Artículos disponibles: {filteredCatalog.length}</Badge>
            <div className="flex gap-2">
              {(['all', 'común', 'raro', 'épico', 'legendario'] as const).map(option => (
                <Button
                  key={option}
                  size="sm"
                  variant={selectedRarity === option ? 'default' : 'outline'}
                  onClick={() => setSelectedRarity(option)}
                >
                  {option === 'all' ? 'Todos' : option}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCatalog.map(item => (
              <RewardCard
                key={item.id}
                item={item}
                onInspect={() => setSelectedItem(item)}
                onPurchase={async () => {
                  await purchaseItem({ itemId: item.id });
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bendiciones Diarias</CardTitle>
              <CardDescription>
                Inicia sesión cada día para reclamar recompensas adicionales y mantener tu motivación.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {(dailyRewardsData?.upcomingRewards ?? []).map((reward, index) => {
                const isToday = index === 0;
                const canClaim = isToday && dailyRewardsData?.canClaimToday;
                const isClaimed = dailyRewardsData?.claimedToday && isToday;

                const rewardText = reward.rewards.map(r =>
                  `${r.amount} ${r.type === 'coins' ? 'monedas' : r.type === 'gems' ? 'gemas' : r.type === 'xp' ? 'XP' : r.type}`
                ).join(', ');

                return (
                  <div key={reward.day} className={cn('rounded-lg border p-4', isClaimed && 'border-primary')}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Día {reward.day}</span>
                      <Badge variant={isClaimed ? 'default' : 'outline'}>
                        {isClaimed ? 'Reclamado' : isToday ? 'Hoy' : 'Próximo'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{rewardText}</p>
                    {isToday && (
                      <Button
                        className="mt-3 w-full"
                        size="sm"
                        disabled={!canClaim || isClaimed}
                        onClick={async () => {
                          await claimDailyReward();
                        }}
                      >
                        {isClaimed ? 'Reclamado' : 'Reclamar'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <CollectionOverview userRewards={userRewards} />
        </TabsContent>
      </Tabs>

      <RewardDialog item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

function CurrencyHeader({ userRewards }: { userRewards: UserRewards | undefined }) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-6 text-center md:grid-cols-4">
        <CurrencyStat icon={Coins} label="Monedas de Dragón" value={userRewards?.monedasDragon ?? 0} accent="text-amber-600" />
        <CurrencyStat icon={Gem} label="Cristales Mágicos" value={userRewards?.cristalesMagicos ?? 0} accent="text-cyan-600" />
        <CurrencyStat icon={Trophy} label="Tesoro Desbloqueado" value={userRewards?.totalItemsUnlocked ?? 0} accent="text-purple-600" />
        <CurrencyStat icon={Award} label="Emblemas" value={userRewards?.emblemas?.length ?? 0} accent="text-green-600" />
      </CardContent>
    </Card>
  );
}

function CurrencyStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-lg font-bold">
        <Icon className={cn('h-5 w-5', accent)} />
        <span>{value.toLocaleString()}</span>
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function RewardCard({
  item,
  onInspect,
  onPurchase,
}: {
  item: RewardItem;
  onInspect: () => void;
  onPurchase: () => Promise<void>;
}) {
  const rarityStyles: Record<RewardItem['rarity'], string> = {
    común: 'border-gray-200 dark:border-gray-700',
    raro: 'border-blue-200 dark:border-blue-700',
    épico: 'border-purple-200 dark:border-purple-700',
    legendario: 'border-amber-200 dark:border-amber-700',
  };

  const iconByCategory: Record<RewardItem['category'], React.ComponentType<{ className?: string }>> = {
    tema: Palette,
    emblema: Stars,
    potenciador: Sparkles,
    utilidad: RefreshCw,
  };

  const Icon = iconByCategory[item.category];

  return (
    <Card className={cn('flex h-full flex-col border-2', rarityStyles[item.rarity])}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {item.rarity}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          <span>{item.category}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            {item.costMonedasDragon} Monedas de Dragón
          </div>
          {item.costCristalesMagicos ? (
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-cyan-500" />
              {item.costCristalesMagicos} Cristales Mágicos
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex-1" onClick={onPurchase}>
            Comprar
          </Button>
          <Button variant="outline" onClick={onInspect}>
            Detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CollectionOverview({ userRewards }: { userRewards: UserRewards | undefined }) {
  const emblemas = userRewards?.emblemas ?? [];
  const completion = emblemas.length ? Math.min(100, emblemas.length * 10) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tu Tesoro Legendario</CardTitle>
        <CardDescription>
          Visualiza los emblemas que has conquistado y cuánto falta para completar tu colección.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Camino del Guerrero</p>
          <Progress value={completion} className="mt-2 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">Colección completada al {completion}%</p>
        </div>
        {emblemas.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aún no has desbloqueado emblemas. Participa en misiones y actividades para conseguirlos.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {emblemas.map(emblema => (
              <div key={emblema.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">{emblema.name}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Conquistado el {new Date().toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RewardDialog({ item, onClose }: { item: RewardItem | null; onClose: () => void }) {
  if (!item) return null;

  const rarityDescriptions: Record<RewardItem['rarity'], string> = {
    común: 'Objetos frecuentes para personalizar tu experiencia.',
    raro: 'Ofertas exclusivas con beneficios extra.',
    épico: 'Recompensas destacadas con efectos especiales.',
    legendario: 'Artículos únicos reservados para los mejores estudiantes.',
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="font-medium capitalize">Rareza: {item.rarity}</p>
          <p className="text-muted-foreground">{rarityDescriptions[item.rarity]}</p>
          <div className="space-y-1">
            <p className="font-medium">Costos</p>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              {item.costMonedasDragon} Monedas de Dragón
            </div>
            {item.costCristalesMagicos ? (
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-cyan-500" />
                {item.costCristalesMagicos} Cristales Mágicos
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
