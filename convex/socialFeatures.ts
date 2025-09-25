import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper function to get current user
async function getUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("byClerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) throw new Error("User not found");
  return user;
}

// ===== FRIENDSHIP SYSTEM =====

// Send friend request
export const sendFriendRequest = mutation({
  args: { 
    friendEmail: v.string(),
    message: v.optional(v.string()) 
  },
  handler: async (ctx, { friendEmail, message }) => {
    const user = await getUser(ctx);
    
    // Find the friend by email
    const friend = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('email'), friendEmail))
      .unique();
    
    if (!friend) {
      throw new Error("User not found with this email");
    }
    
    if (friend._id === user._id) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query('friendships')
      .withIndex('byUsers', q => q.eq('requesterId', user._id).eq('addresseeId', friend._id))
      .unique();
      
    const reverseExisting = await ctx.db
      .query('friendships')
      .withIndex('byUsers', q => q.eq('requesterId', friend._id).eq('addresseeId', user._id))
      .unique();

    if (existingFriendship || reverseExisting) {
      throw new Error("Friend request already exists or you are already friends");
    }

    const friendshipId = await ctx.db.insert('friendships', {
      requesterId: user._id,
      addresseeId: friend._id,
      status: 'pending',
      createdAt: Math.floor(Date.now() / 1000),
    });

    return { friendshipId, message: "Friend request sent!" };
  }
});

// Accept friend request
export const acceptFriendRequest = mutation({
  args: { friendshipId: v.id('friendships') },
  handler: async (ctx, { friendshipId }) => {
    const user = await getUser(ctx);
    
    const friendship = await ctx.db.get(friendshipId);
    if (!friendship) throw new Error("Friend request not found");
    
    if (friendship.addresseeId !== user._id) {
      throw new Error("Not authorized to accept this request");
    }
    
    if (friendship.status !== 'pending') {
      throw new Error("Friend request is not pending");
    }

    await ctx.db.patch(friendshipId, {
      status: 'accepted',
      acceptedAt: Math.floor(Date.now() / 1000),
    });

    return { message: "Friend request accepted!" };
  }
});

// Get friends list
export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Get accepted friendships where user is either requester or addressee
    const sentRequests = await ctx.db
      .query('friendships')
      .withIndex('byRequester', q => q.eq('requesterId', user._id))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .collect();
    
    const receivedRequests = await ctx.db
      .query('friendships')
      .withIndex('byAddressee', q => q.eq('addresseeId', user._id))
      .filter(q => q.eq(q.field('status'), 'accepted'))
      .collect();

    // Get friend details and their stats
    const friends = [];
    
    for (const friendship of sentRequests) {
      const friend = await ctx.db.get(friendship.addresseeId);
      const friendStats = await ctx.db
        .query('userStats')
        .withIndex('byUser', q => q.eq('userId', friendship.addresseeId))
        .unique();
        
      if (friend) {
        friends.push({
          id: friend._id,
          name: friend.name,
          email: friend.email,
          level: friendStats?.level || 1,
          totalPoints: friendStats?.totalPoints || 0,
          currentStreak: friendStats?.currentStreak || 0,
          friendshipId: friendship._id,
          friendedAt: friendship.acceptedAt,
        });
      }
    }
    
    for (const friendship of receivedRequests) {
      const friend = await ctx.db.get(friendship.requesterId);
      const friendStats = await ctx.db
        .query('userStats')
        .withIndex('byUser', q => q.eq('userId', friendship.requesterId))
        .unique();
        
      if (friend) {
        friends.push({
          id: friend._id,
          name: friend.name,
          email: friend.email,
          level: friendStats?.level || 1,
          totalPoints: friendStats?.totalPoints || 0,
          currentStreak: friendStats?.currentStreak || 0,
          friendshipId: friendship._id,
          friendedAt: friendship.acceptedAt,
        });
      }
    }

    return friends.sort((a, b) => b.totalPoints - a.totalPoints);
  }
});

// Get pending friend requests
export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Get pending requests where user is addressee (requests TO user)
    const pendingRequests = await ctx.db
      .query('friendships')
      .withIndex('byAddressee', q => q.eq('addresseeId', user._id))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();

    const requests = [];
    for (const request of pendingRequests) {
      const requester = await ctx.db.get(request.requesterId);
      if (requester) {
        requests.push({
          id: request._id,
          requester: {
            id: requester._id,
            name: requester.name,
            email: requester.email,
          },
          createdAt: request.createdAt,
        });
      }
    }

    return requests;
  }
});

// ===== STUDY GROUPS =====

// Create study group
export const createStudyGroup = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    subject: v.optional(v.string()),
    level: v.optional(v.string()),
    isPrivate: v.boolean(),
    maxMembers: v.number(),
  },
  handler: async (ctx, { name, description, subject, level, isPrivate, maxMembers }) => {
    const user = await getUser(ctx);
    
    // Generate invite code for private groups
    const inviteCode = isPrivate ? generateInviteCode() : undefined;
    
    const groupId = await ctx.db.insert('studyGroups', {
      name,
      description,
      creatorId: user._id,
      members: [{
        userId: user._id,
        role: 'creator',
        joinedAt: Math.floor(Date.now() / 1000),
        totalPoints: 0,
        weeklyPoints: 0,
      }],
      isPrivate,
      inviteCode,
      subject,
      level,
      maxMembers,
      goals: {
        weeklyQuizzes: 5,
        averageScore: 0.7,
        studyStreak: 7,
      },
      stats: {
        totalQuizzes: 0,
        averageScore: 0,
        currentStreak: 0,
        totalPoints: 0,
        weeklyProgress: 0,
      },
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });

    return { groupId, inviteCode, message: "Study group created successfully!" };
  }
});

// Join study group
export const joinStudyGroup = mutation({
  args: {
    groupId: v.optional(v.id('studyGroups')),
    inviteCode: v.optional(v.string()),
  },
  handler: async (ctx, { groupId, inviteCode }) => {
    const user = await getUser(ctx);
    
    let group;
    
    if (inviteCode) {
      group = await ctx.db
        .query('studyGroups')
        .withIndex('byInviteCode', q => q.eq('inviteCode', inviteCode))
        .unique();
    } else if (groupId) {
      group = await ctx.db.get(groupId);
    } else {
      throw new Error("Either groupId or inviteCode must be provided");
    }
    
    if (!group) {
      throw new Error("Study group not found");
    }
    
    // Check if user is already a member
    if (group.members.some(m => m.userId === user._id)) {
      throw new Error("Already a member of this group");
    }
    
    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      throw new Error("Study group is full");
    }

    const updatedMembers = [...group.members, {
      userId: user._id,
      role: 'member',
      joinedAt: Math.floor(Date.now() / 1000),
      totalPoints: 0,
      weeklyPoints: 0,
    }];

    await ctx.db.patch(group._id, {
      members: updatedMembers,
      updatedAt: Math.floor(Date.now() / 1000),
    });

    return { message: "Successfully joined the study group!" };
  }
});

// Get user's study groups
export const getMyStudyGroups = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    // Find groups where user is a member
    const allGroups = await ctx.db.query('studyGroups').collect();
    const userGroups = allGroups.filter(group => 
      group.members.some(member => member.userId === user._id)
    );

    const groupsWithDetails = await Promise.all(
      userGroups.map(async (group) => {
        // Get member details
        const membersWithDetails = await Promise.all(
          group.members.map(async (member) => {
            const memberUser = await ctx.db.get(member.userId);
            const memberStats = await ctx.db
              .query('userStats')
              .withIndex('byUser', q => q.eq('userId', member.userId))
              .unique();
              
            return {
              ...member,
              name: memberUser?.name || 'Unknown',
              level: memberStats?.level || 1,
              avatar: memberUser?.avatarUrl,
            };
          })
        );

        return {
          ...group,
          members: membersWithDetails,
          userRole: group.members.find(m => m.userId === user._id)?.role,
        };
      })
    );

    return groupsWithDetails;
  }
});

// Get public study groups (for discovery)
export const getPublicStudyGroups = query({
  args: {
    subject: v.optional(v.string()),
    level: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { subject, level, limit = 20 }) => {
    let query = ctx.db.query('studyGroups').filter(q => q.eq(q.field('isPrivate'), false));
    
    if (subject) {
      query = query.filter(q => q.eq(q.field('subject'), subject));
    }
    
    if (level) {
      query = query.filter(q => q.eq(q.field('level'), level));
    }

    const groups = await query.take(limit);
    
    return groups.map(group => ({
      ...group,
      memberCount: group.members.length,
      // Don't return full member details for privacy
      members: undefined,GetuserstudyGroupsuserStatsbyUseruserIdUnknownstudyGroupsisPrivatesubjectleveltreturnfullmemberdetailsforprivacymembers
    }));
  }
});

// ===== GROUP CHALLENGES =====

// Create group challenge
export const createGroupChallenge = mutation({
  args: {
    groupId: v.id('studyGroups'),
    title: v.string(),
    description: v.string(),
    type: v.string(),
    durationDays: v.number(),
    target: v.number(),
    metric: v.string(),
    subjects: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { groupId, title, description, type, durationDays, target, metric, subjects }) => {
    const user = await getUser(ctx);
    
    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Study group not found");
    
    // Check if user is admin or creator
    const userMember = group.members.find(m => m.userId === user._id);
    if (!userMember || !['creator', 'admin'].includes(userMember.role)) {
      throw new Error("Not authorized to create challenges in this group");
    }

    const now = Math.floor(Date.now() / 1000);
    const challengeId = await ctx.db.insert('groupChallenges', {
      groupId,
      title,
      description,
      type,
      startDate: now,
      endDate: now + (durationDays * 24 * 60 * 60),
      rules: {
        target,
        metric,
        subjects,
      },
      participants: group.members.map(member => ({
        userId: member.userId,
        progress: 0,
        score: 0,
        joinedAt: now,
        completed: false,
      })),
      rewards: {
        winner: {
          points: Math.floor(target * 10),
          badge: `${type}_winner`,
        },
        participant: {
          points: Math.floor(target * 2),
        },
      },
      status: 'active',
      createdAt: now,
    });

    return { challengeId, message: "Group challenge created!" };
  }
});

// Get group challenges
export const getGroupChallenges = query({
  args: { groupId: v.id('studyGroups') },
  handler: async (ctx, { groupId }) => {
    const user = await getUser(ctx);
    
    const challenges = await ctx.db
      .query('groupChallenges')
      .withIndex('byGroup', q => q.eq('groupId', groupId))
      .collect();

    // Add participant details and current user's progress
    const challengesWithDetails = await Promise.all(
      challenges.map(async (challenge) => {
        const participantsWithDetails = await Promise.all(
          challenge.participants.map(async (participant) => {
            const participantUser = await ctx.db.get(participant.userId);
            return {
              ...participant,
              name: participantUser?.name || 'Unknown',
            };
          })
        );

        const userParticipant = challenge.participants.find(p => p.userId === user._id);

        return {
          ...challenge,
          participants: participantsWithDetails.sort((a, b) => b.score - a.score),
          userProgress: userParticipant,
          daysRemaining: Math.max(0, Math.ceil((challenge.endDate - Math.floor(Date.now() / 1000)) / (24 * 60 * 60))),
        };
      })
    );

    return challengesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  }
});

// ===== GLOBAL COMPETITIONS =====

// Get active competitions
export const getActiveCompetitions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    const competitions = await ctx.db
      .query('globalCompetitions')
      .withIndex('byStatus', q => q.eq('status', 'active'))
      .filter(q => q.lte(q.field('startDate'), now))
      .filter(q => q.gte(q.field('endDate'), now))
      .collect();

    return competitions.map(competition => {
      const userParticipant = competition.participants.find(p => p.userId === user._id);
      
      return {
        ...competition,
        userParticipation: userParticipant,
        participantCount: competition.participants.length,
        daysRemaining: Math.ceil((competition.endDate - now) / (24 * 60 * 60)),
        // Show only top participants for privacy
        leaderboard: competition.participants
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map(p => ({
            rank: p.rank,
            score: p.score,
            isCurrentUser: p.userId === user._id,
          })),
      };
    });
  }
});

// Join global competition
export const joinGlobalCompetition = mutation({
  args: { competitionId: v.id('globalCompetitions') },
  handler: async (ctx, { competitionId }) => {
    const user = await getUser(ctx);
    
    const competition = await ctx.db.get(competitionId);
    if (!competition) throw new Error("Competition not found");
    
    if (competition.status !== 'registration' && competition.status !== 'active') {
      throw new Error("Competition is not open for registration");
    }
    
    // Check if user already joined
    if (competition.participants.some(p => p.userId === user._id)) {
      throw new Error("Already joined this competition");
    }

    // Check eligibility
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
      
    if (competition.rules.eligibility.minLevel && 
        (userStats?.level || 1) < competition.rules.eligibility.minLevel) {
      throw new Error("Level requirement not met");
    }

    const updatedParticipants = [...competition.participants, {
      userId: user._id,
      score: 0,
      rank: competition.participants.length + 1,
      progress: {
        quizzesCompleted: 0,
        averageScore: 0,
        pointsEarned: 0,
        bestStreak: 0,
      },
      joinedAt: Math.floor(Date.now() / 1000),
    }];

    await ctx.db.patch(competitionId, {
      participants: updatedParticipants,
    });

    return { message: "Successfully joined the competition!" };
  }
});

// Helper function to generate invite codes
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Update user's progress in challenges (called when user completes quizzes)
export const updateChallengeProgress = mutation({
  args: {
    userId: v.id('users'),
    metric: v.string(),
    value: v.number(),
    subjects: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { userId, metric, value, subjects }) => {
    const now = Math.floor(Date.now() / 1000);
    
    // Find active challenges user is participating in
    const activeChallenges = await ctx.db
      .query('groupChallenges')
      .withIndex('byStatus', q => q.eq('status', 'active'))
      .filter(q => q.lte(q.field('startDate'), now))
      .filter(q => q.gte(q.field('endDate'), now))
      .collect();

    for (const challenge of activeChallenges) {
      const participant = challenge.participants.find(p => p.userId === userId);
      if (!participant) continue;
      
      // Check if challenge rules match the metric
      if (challenge.rules.metric !== metric) continue;
      
      // Check subject filter if applicable
      if (challenge.rules.subjects && subjects) {
        const hasMatchingSubject = challenge.rules.subjects.some(s => 
          subjects.includes(s)
        );
        if (!hasMatchingSubject) continue;
      }
      
      // Update participant progress
      const updatedParticipants = challenge.participants.map(p => {
        if (p.userId === userId) {
          const newProgress = p.progress + value;
          return {
            ...p,
            progress: newProgress,
            score: newProgress,
            completed: newProgress >= challenge.rules.target,
          };
        }
        return p;
      });
      
      await ctx.db.patch(challenge._id, {
        participants: updatedParticipants,
      });
    }

    // Also update global competitions
    const activeCompetitions = await ctx.db
      .query('globalCompetitions')
      .withIndex('byStatus', q => q.eq('status', 'active'))
      .filter(q => q.lte(q.field('startDate'), now))
      .filter(q => q.gte(q.field('endDate'), now))
      .collect();

    for (const competition of activeCompetitions) {
      const participant = competition.participants.find(p => p.userId === userId);
      if (!participant) continue;
      
      if (competition.rules.scoring.metric === metric) {
        const updatedParticipants = competition.participants.map(p => {
          if (p.userId === userId) {
            const newScore = p.score + value;
            const newProgress = { ...p.progress };
            
            // Update specific progress metrics
            if (metric === 'quizzes_completed') {
              newProgress.quizzesCompleted += 1;
            } else if (metric === 'total_points') {
              newProgress.pointsEarned += value;
            }
            
            return {
              ...p,
              score: newScore,
              progress: newProgress,
            };
          }
          return p;
        });
        
        // Recalculate ranks
        const sortedParticipants = updatedParticipants
          .sort((a, b) => b.score - a.score)
          .map((p, index) => ({ ...p, rank: index + 1 }));
        
        await ctx.db.patch(competition._id, {
          participants: sortedParticipants,
        });
      }
    }
  }
});