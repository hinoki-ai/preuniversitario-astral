'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserStats, ShopItem } from '@/lib/types';

import {
  Sparkles,
  Zap,
  Target,
  BookOpen,
  Brain,
  Eye,
  TrendingUp,
  Clock,
  Shield,
  Star,
  Gem,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  ShoppingCart
} from 'lucide-react';

const categoryIcons = {
  learning_boost: Zap,
  exclusive_content: BookOpen,
  learning_tool: Brain,
  study_enhancement: Target,
};

const rarityColors = {
  common: 'bg-gray-100 text-gray-800',
  rare: 'bg-blue-100 text-blue-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-orange-100 text-orange-800',
};

export function EsenciaShop() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const { toast } = useToast();
  
  const shopItems = useQuery(api.esenciaShop.getEsenciaShopItems, {
    category: selectedCategory,
  }) as ShopItem[] | undefined;
  const userStats = useQuery(api.userStats.getUserStats) as UserStats | undefined;

  const mySharedMaterials = useQuery(api.studyMaterialSharing.getMySharedMaterials);
  const purchaseItem = useMutation(api.esenciaShop.purchaseEsenciaItem);
  const activateItem = useMutation(api.esenciaShop.activateItem);
  
  const handlePurchase = async (itemId: string) => {
    try {
      const result = await purchaseItem({ itemId });
      toast({
        title: "Purchase Successful!",
        description: `You've purchased ${result.item.name}. New balance: ${result.newEsenciaBalance} Esencia Arcana`,
      });
      setSelectedItem(null);
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleActivate = async (itemId: string, category: string) => {
    try {
      await activateItem({ itemId, category });
      toast({
        title: "Item Activated!",
        description: "Your learning enhancement is now active",
      });
    } catch (error: any) {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (!shopItems) {
    return <div>Loading Esencia Arcana Shop...</div>;
  }
  
  const userEsencia = userStats?.esenciaArcana ?? 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Esencia Arcana Shop
              </CardTitle>
              <CardDescription>
                Enhance your learning with powerful tools and exclusive content
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Gem className="h-5 w-5 text-purple-600" />
                {userEsencia} Esencia
              </div>
              <p className="text-sm text-muted-foreground">Available to spend</p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Category Filters */}
      <Tabs value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="learning_boost" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Boosts
          </TabsTrigger>
          <TabsTrigger value="exclusive_content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="learning_tool" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="study_enhancement" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Enhancements
          </TabsTrigger>
        </TabsList>
        
        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {shopItems.map((item) => {
            const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Star;
            const canAfford = userEsencia >= item.cost;
            
            return (
              <Card key={item.id} className={`relative transition-all hover:shadow-lg ${!item.available ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </div>
                    <Badge className={rarityColors[item.rarity as keyof typeof rarityColors] || 'bg-gray-100 text-gray-800'}>
                      {item.rarity}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Item Details */}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {item.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(item.duration / 60)}min
                        </div>
                      )}
                      {item.usesRemaining && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {item.usesRemaining} uses
                        </div>
                      )}
                      {item.minLevel && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Level {item.minLevel}+
                        </div>
                      )}
                    </div>
                    
                    {/* Price and Purchase */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-semibold">
                        <Gem className="h-4 w-4 text-purple-600" />
                        {item.cost}
                      </div>
                      
                      {item.owned ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Owned
                        </Badge>
                      ) : !item.available ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Level {item.minLevel} Required
                        </Badge>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              disabled={!canAfford}
                              onClick={() => setSelectedItem(item)}
                            >
                              {canAfford ? (
                                <>
                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                  Buy
                                </>
                              ) : (
                                'Not enough Esencia'
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Purchase {item.name}?</DialogTitle>
                              <DialogDescription>
                                This will cost {item.cost} Esencia Arcana. You have {userEsencia} available.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">What you get:</h4>
                                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                {item.effect && (
                                  <p className="text-xs"><strong>Effect:</strong> {item.effect.replace(/_/g, ' ')}</p>
                                )}
                                {item.duration && (
                                  <p className="text-xs"><strong>Duration:</strong> {Math.floor(item.duration / 60)} minutes</p>
                                )}
                                {item.usesRemaining && (
                                  <p className="text-xs"><strong>Uses:</strong> {item.usesRemaining}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handlePurchase(item.id)}
                                  className="flex-1"
                                >
                                  Confirm Purchase
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedItem(null)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {shopItems.length === 0 && (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items available</h3>
            <p className="text-muted-foreground">
              {selectedCategory 
                ? 'No items in this category match your level.' 
                : 'Keep studying to unlock more items!'}
            </p>
          </Card>
        )}
      </Tabs>
      
      {/* How to Earn Esencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How to Earn More Esencia Arcana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-semibold">Complete Daily Missions</h4>
                <p className="text-sm text-muted-foreground">Higher difficulty = more Esencia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Star className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-semibold">Unlock Achievements</h4>
                <p className="text-sm text-muted-foreground">Each achievement rewards Esencia</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-semibold">Master Concepts</h4>
                <p className="text-sm text-muted-foreground">Deep learning gives bonus rewards</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-semibold">Maintain Study Streaks</h4>
                <p className="text-sm text-muted-foreground">Consistency multiplies your gains</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}