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
  costCoins: number;
  costGems?: number;
  category: 'theme' | 'badge' | 'booster' | 'utility';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserRewards {
  coins?: number;
  gems?: number;
  badges?: Array<{ id: string; name: string }>;
  totalItemsUnlocked?: number;
}

export function RewardsShop() {
  const [selectedRarity, setSelectedRarity] = useState<'all' | RewardItem['rarity']>('all');
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);

  const userRewards = useQuery(api.rewardsSystem.getUserRewards) as UserRewards | undefined;
  const catalogItems = useQuery(api.rewardsSystem.getRewardsCatalog, {}) as RewardItem[] | undefined;
  const dailyRewards = useQuery(api.rewardsSystem.getDailyLoginRewards) as Array<{
    id: string;
    day: number;
    reward: string;
    claimed?: boolean;
  }> | undefined;

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
            <ShoppingCart className="h-4 w-4" />
            Tienda
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Recompensas diarias
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Colección
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">Artículos disponibles: {filteredCatalog.length}</Badge>
            <div className="flex gap-2">
              {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map(option => (
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
              <CardTitle className="text-base">Bonos diarios</CardTitle>
              <CardDescription>
                Inicia sesión cada día para reclamar recompensas adicionales y mantener tu motivación.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {(dailyRewards ?? []).map(reward => (
                <div key={reward.id} className={cn('rounded-lg border p-4', reward.claimed && 'border-primary')}> 
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Día {reward.day}</span>
                    <Badge variant={reward.claimed ? 'default' : 'outline'}>
                      {reward.claimed ? 'Reclamado' : 'Disponible'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{reward.reward}</p>
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    disabled={reward.claimed}
                    onClick={async () => {
                      await claimDailyReward({ rewardId: reward.id });
                    }}
                  >
                    Reclamar
                  </Button>
                </div>
              ))}
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
        <CurrencyStat icon={Coins} label="Monedas" value={userRewards?.coins ?? 0} accent="text-amber-600" />
        <CurrencyStat icon={Gem} label="Gemas" value={userRewards?.gems ?? 0} accent="text-cyan-600" />
        <CurrencyStat icon={Trophy} label="Ítems desbloqueados" value={userRewards?.totalItemsUnlocked ?? 0} accent="text-purple-600" />
        <CurrencyStat icon={Award} label="Insignias" value={userRewards?.badges?.length ?? 0} accent="text-green-600" />
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
    common: 'border-gray-200 dark:border-gray-700',
    rare: 'border-blue-200 dark:border-blue-700',
    epic: 'border-purple-200 dark:border-purple-700',
    legendary: 'border-amber-200 dark:border-amber-700',
  };

  const iconByCategory: Record<RewardItem['category'], React.ComponentType<{ className?: string }>> = {
    theme: Palette,
    badge: Stars,
    booster: Sparkles,
    utility: RefreshCw,
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
            {item.costCoins} monedas
          </div>
          {item.costGems ? (
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-cyan-500" />
              {item.costGems} gemas
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
  const badges = userRewards?.badges ?? [];
  const completion = badges.length ? Math.min(100, badges.length * 10) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tu colección</CardTitle>
        <CardDescription>
          Visualiza los elementos que has desbloqueado y cuánto falta para completar la colección.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Progreso</p>
          <Progress value={completion} className="mt-2 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">Colección completada al {completion}%</p>
        </div>
        {badges.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Aún no has desbloqueado insignias. Participa en misiones y actividades para conseguirlas.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {badges.map(badge => (
              <div key={badge.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">{badge.name}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Obtenida el {new Date().toLocaleDateString()}
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
    common: 'Objetos frecuentes para personalizar tu experiencia.',
    rare: 'Ofertas exclusivas con beneficios extra.',
    epic: 'Recompensas destacadas con efectos especiales.',
    legendary: 'Artículos únicos reservados para los mejores estudiantes.',
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
              {item.costCoins} monedas
            </div>
            {item.costGems ? (
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-cyan-500" />
                {item.costGems} gemas
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
