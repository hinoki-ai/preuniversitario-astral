'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  ShoppingCart, 
  Star, 
  Crown, 
  Palette, 
  User, 
  Award, 
  Zap, 
  Coins,
  Gem,
  Gift,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  Clock,
  TrendingUp,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const rarityconfig = {
  common: {
    name: 'Common',;
    color: 'text-gray-600',;
    bgColor: 'bg-gray-100 dark:bg-gray-800',;
    borderColor: 'border-gray-300 dark:border-gray-600',;
    sparkle: '✨',
  },
  rare: {
    name: 'Rare',;
    color: 'text-blue-600',;
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',;
    borderColor: 'border-blue-300 dark:border-blue-600',;
    sparkle: '💫',
  },
  epic: {
    name: 'Epic',;
    color: 'text-purple-600',;
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',;
    borderColor: 'border-purple-300 dark:border-purple-600',;
    sparkle: '⭐',
  },
  legendary: {
    name: 'Legendary',;
    color: 'text-amber-600',;
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',;
    borderColor: 'border-amber-300 dark:border-amber-600',;
    sparkle: '🌟',
  },
};

export function RewardsShop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [activeTab, setActiveTab] = useState('shop');
  
  const userRewards = useQuery(api.rewardsSystem.getUserRewards);
  const catalogItems = useQuery(api.rewardsSystem.getRewardsCatalog, {});
  const dailyRewards = useQuery(api.rewardsSystem.getDailyLoginRewards);

  return (
    <div className="space-y-6">
      {/* Currency Header */}
      <CurrencyHeader userRewards={userRewards} />

      {/* Rewards Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="customization" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Daily Rewards
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Collection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <ShopTab 
            catalogItems={catalogItems} 
            userRewards={userRewards}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
          />
        </TabsContent>

        <TabsContent value="customization">
          <CustomizationTab userRewards={userRewards} />
        </TabsContent>

        <TabsContent value="daily">
          <DailyRewardsTab dailyRewards={dailyRewards} />
        </TabsContent>

        <TabsContent value="collection">
          <CollectionTab userRewards={userRewards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CurrencyHeader({ userRewards }: { userRewards: any }) {
  if (!userRewards) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-5 w-5 text-amber-600" />
              <span className="text-lg font-bold text-amber-600">
                {userRewards.coins?.toLocaleString() || 0}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Coins</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Gem className="h-5 w-5 text-cyan-600" />
              <span className="text-lg font-bold text-cyan-600">
                {userRewards.gems || 0}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Gems</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {userRewards.totalItemsUnlocked || 0}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Items Unlocked</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Award className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                {userRewards.badges?.length || 0}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShopTab({ 
  catalogItems, 
  userRewards, 
  selectedCategory, 
  setSelectedCategory,
  selectedRarity,
  setSelectedRarity 
}: {
  catalogItems: any;
  userRewards: any;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedRarity: string;
  setSelectedRarity: (rarity: string) => void;
}) {
  
  const filteredItems = catalogItems?.filter((item: any) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && item.visual.rarity !== selectedRarity) return false;
    return true;
  }) || [];

  const categories = [...new Set(catalogItems?.map((item: any) => item.category) || [])];
  const rarities = [...new Set(catalogItems?.map((item: any) => item.visual.rarity) || [])];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rarity</label>
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Rarities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  {rarities.map(rarity => (
                    <SelectItem key={rarity} value={rarity} className="capitalize">
                      {rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SelectContent>
      </Card>

      {/* Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item: any) => (
          <ShopItemCard key={item.itemId} item={item} userRewards={userRewards} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">No items found</div>
            <div className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ShopItemCard({ item, userRewards }: { item: any; userRewards: any }) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  const purchaseItem = useMutation(api.rewardsSystem.purchaseShopItem);
  const unlockItem = useMutation(api.rewardsSystem.unlockReward);
  
  const rarityConfig = rarityConfig[item.visual.rarity as keyof typeof rarityConfig];
  const isShopItem = item.unlockRequirements.type === 'shop_purchase';
  const canAfford = isShopItem && userRewards && (
    (item.unlockRequirements.shopCost.currency === 'coins' && userRewards.coins >= item.unlockRequirements.shopCost.amount) ||
    (item.unlockRequirements.shopCost.currency === 'gems' && userRewards.gems >= item.unlockRequirements.shopCost.amount)
  );

  const handlepurchase = async () => {
    try {
      if (isShopItem) {
        const result = await purchaseItem({ itemId: item.itemId });
        toast({
          title: "Purchase Successful!",
          description: `You bought ${result.itemPurchased.name}`,
        });
      }

 else {
        const result = await unlockItem({ itemId: item.itemId });
        toast({
          title: "Item Unlocked!",
          description: `You unlocked ${result.itemUnlocked.name}`,
        });
      }
    }

 catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getitemicon = (itemType: string) => {
    switch (itemType) {
      case 'theme': return palette;
      case 'avatar': return user;
      case 'title': return crown;
      case 'badge': return award;
      case 'perk': return zap;
      default: return star;
    }
  };

  const ItemIcon = getItemIcon(item.itemType);

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      item.isOwned && "ring-2 ring-green-200 dark:ring-green-800",
      rarityConfig.borderColor
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-3 rounded-lg",
              rarityConfig.bgColor
            )}>
              <ItemIcon className={cn("h-6 w-6", rarityConfig.color)} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold leading-tight">
                {rarityConfig.sparkle} {item.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {item.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Rarity and Category */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs capitalize",
              rarityConfig.color,
              rarityConfig.bgColor,
              rarityConfig.borderColor
            )}
          >
            {rarityConfig.name}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {item.itemType}
          </Badge>
        </div>

        {/* Unlock Requirements */}
        <div className="space-y-2">
          {item.isOwned ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Owned</span>
            </div>
          ) : item.canUnlock && !isShopItem ? (
            <Button onClick={handlePurchase} className="w-full" size="sm">
              <Star className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          ) : isShopItem ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Price:</span>
                <div className="flex items-center gap-1">
                  {item.unlockRequirements.shopCost.currency === 'coins' ? (
                    <Coins className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Gem className="h-4 w-4 text-cyan-600" />
                  )}
                  <span className="font-semibold">
                    {item.unlockRequirements.shopCost.amount}
                  </span>
                </div>
              </div>
              <Button 
                onClick={handlePurchase} 
                className="w-full" 
                size="sm"
                disabled={!canAfford}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {canAfford ? "Purchase" : "Not enough currency"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lock className="h-4 w-4" />
              <span>Requirements not met</span>
            </div>
          )}
        </div>

        {/* Requirement Details */}
        {!item.isOwned && !item.canUnlock && (
          <div className="text-xs text-muted-foreground">
            {item.unlockRequirements.type === 'level' && (
              <div>Requires Level {item.unlockRequirements.minLevel}</div>
            )}
            {item.unlockRequirements.type === 'points' && (
              <div>Requires {item.unlockRequirements.minPoints} total points</div>
            )}
            {item.unlockRequirements.type === 'achievement' && (
              <div>Requires specific achievements</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomizationTab({ userRewards }: { userRewards: any }) {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  
  const customizeProfile = useMutation(api.rewardsSystem.customizeProfile);
  const { toast } = useToast();

  const handlesavecustomization = async () => {
    try {
      await customizeProfile({
        selectedTheme: selectedTheme || undefined,
        selectedAvatar: selectedAvatar || undefined,
        selectedTitle: selectedTitle || undefined,
        selectedBadges: selectedBadges.length > 0 ? selectedBadges : undefined,
      });
      toast({
        title: "Profile Updated!",
        description: "Your customization changes have been saved.",
      });
    }

 catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!userRewards) return null;

  return (
    <div className="space-y-6">
      {/* Current Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Preview</CardTitle>
          <CardDescription>Preview your current profile appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold text-xl">
              U
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Your Name</span>
                {userRewards.profileCustomization?.selectedTitle && (
                  <Badge variant="outline" className="text-xs">
                    {userRewards.titles?.find((t: any) => t.id === userRewards.profileCustomization.selectedTitle)?.title}
                  </Badge>
                )}
              </div>
              
              {/* Selected Badges */}
              <div className="flex gap-1 mt-2">
                {userRewards.profileCustomization?.selectedBadges?.slice(0, 3).map((badgeId: string) => {
                  const badge = userRewards.badges?.find((b: any) => b.id === badgeId);
                  return badge ? (
                    <Badge key={badgeId} variant="secondary" className="text-xs">
                      {badge.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRewards.themes?.map((theme: any) => (
              <div 
                key={theme.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  theme.isActive ? "ring-2 ring-primary" : "hover:bg-muted"
                )}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{theme.name}</span>
                  {theme.isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Titles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Titles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRewards.titles?.map((title: any) => (
              <div 
                key={title.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  title.isActive ? "ring-2 ring-primary" : "hover:bg-muted"
                )}
                onClick={() => setSelectedTitle(title.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn("font-medium", title.color)}>{title.title}</div>
                    <div className="text-xs text-muted-foreground">{title.description}</div>
                  </div>
                  {title.isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Badges Selection */}
      {userRewards.badges?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Display Badges (Select up to 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {userRewards.badges.map((badge: any) => (
                <div 
                  key={badge.id}
                  className={cn(
                    "p-2 rounded-lg border cursor-pointer transition-all text-sm",
                    selectedBadges.includes(badge.id) ? "ring-2 ring-primary" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    if (selectedBadges.includes(badge.id)) {
                      setSelectedBadges(selectedBadges.filter(id => id !== badge.id));
                    } else if (selectedBadges.length < 3) {
                      setSelectedBadges([...selectedBadges, badge.id]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{badge.name}</span>
                    {selectedBadges.includes(badge.id) && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-center">
        <Button onClick={handleSaveCustomization} size="lg">
          <Settings2 className="h-4 w-4 mr-2" />
          Save Customization
        </Button>
      </div>
    </div>
  );
}

function DailyRewardsTab({ dailyRewards }: { dailyRewards: any }) {
  const claimDailyReward = useMutation(api.rewardsSystem.claimDailyReward);
  const { toast } = useToast();

  const handleclaimreward = async () => {
    try {
      const result = await claimDailyReward();
      toast({
        title: "Daily Reward Claimed!",
        description: `You received your daily rewards! ${result.newStreak > 1 ? `${result.newStreak} day streak!` : ''}`,
      });
    }

 catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!dailyRewards) return null;

  return (
    <div className="space-y-6">
      {/* Current Streak */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                <Flame className="h-6 w-6" />
                {dailyRewards.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {dailyRewards.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Reward Claim */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Today's Reward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyRewards.canClaimToday ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎁</div>
                  <div className="font-semibold mb-2">Daily Reward Available!</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Day {dailyRewards.nextRewardDay} reward is ready to claim
                  </div>
                  
                  {/* Preview Rewards */}
                  <div className="flex justify-center gap-4 mb-4">
                    {dailyRewards.todaysReward?.rewards.map((reward: any, index: number) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {reward.type === 'coins' && <Coins className="h-4 w-4 text-amber-600" />}
                          {reward.type === 'gems' && <Gem className="h-4 w-4 text-cyan-600" />}
                          {reward.type === 'xp' && <Star className="h-4 w-4 text-purple-600" />}
                          <span className="font-semibold">{reward.amount}</span>
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {reward.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button onClick={handleClaimReward} className="w-full" size="lg">
                <Gift className="h-4 w-4 mr-2" />
                Claim Daily Reward
              </Button>
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <div>Come back tomorrow for your next reward!</div>
              {dailyRewards.loggedInToday && (
                <div className="text-sm mt-1">Already claimed today</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Rewards Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Rewards</CardTitle>
          <CardDescription>Preview of the next 7 daily rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-7">
            {dailyRewards.upcomingRewards?.slice(0, 7).map((dayReward: any, index: number) => (
              <div 
                key={index}
                className={cn(
                  "p-3 rounded-lg border text-center",
                  index === 0 ? "ring-2 ring-primary bg-primary/5" : "bg-muted/50"
                )}
              >
                <div className="text-xs font-medium mb-2">Day {dayReward.day}</div>
                <div className="space-y-1">
                  {dayReward.rewards.map((reward: any, rewardIndex: number) => (
                    <div key={rewardIndex} className="flex items-center justify-center gap-1 text-xs">
                      {reward.type === 'coins' && <Coins className="h-3 w-3 text-amber-600" />}
                      {reward.type === 'gems' && <Gem className="h-3 w-3 text-cyan-600" />}
                      {reward.type === 'xp' && <Star className="h-3 w-3 text-purple-600" />}
                      <span>{reward.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CollectionTab({ userRewards }: { userRewards: any }) {
  if (!userRewards) return null;

  const totalItems = (userRewards.themes?.length || 0) + 
                    (userRewards.avatars?.length || 0) + 
                    (userRewards.titles?.length || 0) + 
                    (userRewards.badges?.length || 0) +
                    (userRewards.perks?.length || 0);

  return (
    <div className="space-y-6">
      {/* Collection Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Collection</CardTitle>
          <CardDescription>All your unlocked items and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{userRewards.themes?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Themes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{userRewards.avatars?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Avatars</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{userRewards.titles?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Titles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{userRewards.badges?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-600">{userRewards.perks?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Perks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Badges */}
        {userRewards.badges?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Badges ({userRewards.badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userRewards.badges.map((badge: any) => (
                <div key={badge.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">{badge.description}</div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs capitalize",
                    badge.rarity === 'legendary' ? 'text-amber-600 border-amber-300' :
                    badge.rarity === 'epic' ? 'text-purple-600 border-purple-300' :
                    badge.rarity === 'rare' ? 'text-blue-600 border-blue-300' :
                    'text-gray-600 border-gray-300'
                  )}

>
                    {badge.rarity}

        {/* Active Perks */}

        {userRewards.perks?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Perks ({userRewards.perks.filter((p: any) => p.isActive).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userRewards.perks.filter((perk: any) => perk.isActive).map((perk: any) => (
                <div key={perk.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{perk.name}</div>
                    <div className="text-xs text-muted-foreground">{perk.description}</div>
                  </div>
                  {perk.expiresAt && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.ceil((perk.expiresAt - Date.now() / 1000) / (24 * 60 * 60))}d left
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Stats */}

      <Card>
        <CardHeader>
          <CardTitle>Collection Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-amber-600">
                {userRewards.totalCoinsEarned?.toLocaleString() || 0}

              </div>
              <div className="text-xs text-muted-foreground">Total Coins Earned</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">
                {userRewards.totalCoinsSpent?.toLocaleString() || 0}

              </div>
              <div className="text-xs text-muted-foreground">Total Coins Spent</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">
                {userRewards.shopPurchases?.length || 0}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
              </div>
              <div className="text-xs text-muted-foreground">Shop Purchases</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}