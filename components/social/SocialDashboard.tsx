'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { 
  Users, 
  UserPlus, 
  Trophy, 
  Crown, 
  Target, 
  Flame, 
  Star,
  Award,
  Mail,
  Clock,
  TrendingUp,
  Calendar,
  Copy,
  Share2,
  Plus,
  Search,
  Filter,
  Medal,
  Zap,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function SocialDashboard() {
  const [activeTab, setActiveTab] = useState('friends');
  const { toast } = useToast();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Social Hub
          </CardTitle>
          <CardDescription>
            Connect with friends, join study groups, and participate in competitions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Social Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="competitions" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Competitions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <FriendsTab />
        </TabsContent>

        <TabsContent value="groups">
          <StudyGroupsTab />
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengesTab />
        </TabsContent>

        <TabsContent value="competitions">
          <CompetitionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FriendsTab() {
  const [friendName, setFriendName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const friends = useQuery(api.socialFeatures.getFriends);
  const pendingRequests = useQuery(api.socialFeatures.getPendingRequests);
  const sendFriendRequest = useMutation(api.socialFeatures.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.socialFeatures.acceptFriendRequest);

  const handleSendRequest = async () => {
    try {
      await sendFriendRequest({ friendName });
      toast({
        title: "Success",
        description: "Friend request sent!",
      });
      setFriendName('');
      setShowAddDialog(false);
    }

 catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest({ friendshipId: friendshipId as any });
      toast({
        title: "Success",
        description: "Friend request accepted!",
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

  return (
    <div className="space-y-6">
      {/* Add Friend Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Friends</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Friend</DialogTitle>
              <DialogDescription>
                Send a friend request by entering their username
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter friend's username"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                type="text"
              />
              <div className="flex gap-2">
                <Button onClick={handleSendRequest} disabled={!friendName}>
                  Send Request
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{request.requester.name}</div>
                    <div className="text-sm text-muted-foreground">{request.requester.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(request.createdAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </Button>
                    <Button size="sm" variant="outline">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      {friends && friends.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <Card key={friend.id}>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  {/* Avatar placeholder */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="font-semibold">{friend.name}</div>
                    <div className="text-sm text-muted-foreground">Level {friend.level}</div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-amber-600">{friend.totalPoints.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{friend.currentStreak}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                  </div>

                  {/* Streak Status */}
                  {friend.currentStreak > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {friend.currentStreak} day streak
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">No friends yet</div>
            <div className="text-sm text-muted-foreground mt-1">
              Add friends to study together and compete!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudyGroupsTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const { toast } = useToast();

  const myGroups = useQuery(api.socialFeatures.getMyStudyGroups);
  const publicGroups = useQuery(api.socialFeatures.getPublicStudyGroups, {});
  const joinStudyGroup = useMutation(api.socialFeatures.joinStudyGroup);

  const handleJoinWithCode = async () => {
    try {
      await joinStudyGroup({ inviteCode });
      toast({
        title: "Success",
        description: "Joined study group!",
      });
      setInviteCode('');
      setShowJoinDialog(false);
    }

 catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Study Groups</h3>
        <div className="flex gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Join with Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Study Group</DialogTitle>
                <DialogDescription>
                  Enter the invite code to join a private study group
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="ABCD1234"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <div className="flex gap-2">
                  <Button onClick={handleJoinWithCode} disabled={!inviteCode}>
                    Join Group
                  </Button>
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <CreateStudyGroupDialog />
        </div>
      </div>

      {/* My Study Groups */}
      {myGroups && myGroups.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-primary">Your Groups</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {myGroups.map((group) => (
              <StudyGroupCard key={group._id} group={group} isMember={true} />
            ))}
          </div>
        </div>
      )}

      {/* Public Study Groups */}
      {publicGroups && publicGroups.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Discover Groups</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {publicGroups.slice(0, 4).map((group) => (
              <StudyGroupCard key={group._id} group={group} isMember={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudyGroupCard({ group, isMember }: { group: any; isMember: boolean }) {
  const joinStudyGroup = useMutation(api.socialFeatures.joinStudyGroup);
  const { toast } = useToast();

  const handleJoin = async () => {
    try {
      await joinStudyGroup({ groupId: group._id });
      toast({
        title: "Success",
        description: "Joined study group!",
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

  const progressPercentage = group.goals?.weeklyQuizzes
    ? (group.stats?.weeklyProgress / group.goals.weeklyQuizzes) * 100
    : 0;

  return (
    <Card className={isMember ? "ring-2 ring-primary/20" : ""}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription className="mt-1">{group.description}</CardDescription>
          </div>
          {isMember && (
            <Badge variant="outline" className="text-primary border-primary">
              Member
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Group Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{isMember ? group.members?.length || 0 : group.memberCount || 0}/{group.maxMembers}</span>
            </div>
            {group.subject && (
              <Badge variant="outline" className="text-xs">
                {group.subject}
              </Badge>
            )}
            {group.level && (
              <Badge variant="outline" className="text-xs capitalize">
                {group.level}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        {isMember && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{group.stats?.totalQuizzes || 0}</div>
              <div className="text-xs text-muted-foreground">Total Quizzes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round((group.stats?.averageScore || 0) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>
        )}

        {/* Weekly Progress */}
        {isMember && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Weekly Goal Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Invite Code */}
        {isMember && group.inviteCode && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <code className="text-sm font-mono">{group.inviteCode}</code>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                navigator.clipboard.writeText(group.inviteCode);
                toast({ title: "Copied!", description: "Invite code copied to clipboard" });
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Action */}
        {!isMember && (
          <Button onClick={handleJoin} className="w-full">
            Join Group
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function CreateStudyGroupDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: '',
    isPrivate: false,
    maxMembers: 10,
  });
  const createStudyGroup = useMutation(api.socialFeatures.createStudyGroup);
  const { toast } = useToast();

  const handleCreate = async () => {
    try {
      const result = await createStudyGroup(formData);
      toast({
        title: "Success",
        description: `Study group created! ${result.inviteCode ? `Invite code: ${result.inviteCode}` : ''}`,
      });
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        subject: '',
        level: '',
        isPrivate: false,
        maxMembers: 10,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
          <DialogDescription>
            Create a new study group to collaborate with other students
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Matemáticas">Mathematics</SelectItem>
                <SelectItem value="Ciencias">Sciences</SelectItem>
                <SelectItem value="Lenguaje">Language</SelectItem>
                <SelectItem value="Historia">History</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
            />
            <label htmlFor="private" className="text-sm">Private group (invite only)</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!formData.name || !formData.description}>
              Create Group
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChallengesTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground">Group Challenges</div>
          <div className="text-sm text-muted-foreground mt-1">
            Join a study group to participate in challenges!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitionsTab() {
  const competitions = useQuery(api.socialFeatures.getActiveCompetitions);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Global Competitions</h3>
      
      {competitions && competitions.length > 0 ? (
        <div className="space-y-4">
          {competitions.map((competition) => (
            <CompetitionCard key={competition._id} competition={competition} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">No active competitions</div>
            <div className="text-sm text-muted-foreground mt-1">
              Check back later for new competitions!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompetitionCard({ competition }: { competition: any }) {
  const joinCompetition = useMutation(api.socialFeatures.joinGlobalCompetition);
  const { toast } = useToast();

  const handleJoin = async () => {
    try {
      await joinCompetition({ competitionId: competition._id });
      toast({
        title: "Success",
        description: "Joined competition!",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              {competition.title}
            </CardTitle>
            <CardDescription className="mt-1">{competition.description}</CardDescription>
          </div>
          {competition.featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Competition Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{competition.participantCount}</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{competition.daysRemaining}</div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {competition.prizes?.[0]?.points || 'TBD'}
            </div>
            <div className="text-xs text-muted-foreground">Top Prize</div>
          </div>
        </div>

        {/* User Progress */}
        {competition.userParticipation && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <Badge variant="outline">Rank #{competition.userParticipation.rank}</Badge>
            </div>
            <div className="text-lg font-bold text-primary">
              {competition.userParticipation.score} points
            </div>
          </div>
        )}

        {/* Leaderboard Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Top Participants</h4>
          <div className="space-y-1">
            {competition.leaderboard?.slice(0, 3).map((participant: any, index: number) => (
              <div 
                key={index}
                className={cn(
                  "flex justify-between items-center p-2 rounded text-sm",
                  participant.isCurrentUser ? "bg-primary/10 font-medium" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-yellow-100 text-yellow-800" :
                    index === 1 ? "bg-gray-100 text-gray-800" :
                    index === 2 ? "bg-orange-100 text-orange-800" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {participant.rank}
                  </div>
                  <span>{participant.isCurrentUser ? "You" : `Participant ${participant.rank}`}</span>
                </div>
                <span className="font-medium">{participant.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        {!competition.userParticipation && (
          <Button onClick={handleJoin} className="w-full">
            Join Competition
          </Button>
        )}
      </CardContent>
    </Card>
  );
}