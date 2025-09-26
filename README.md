# Preuniversitario Astral

## Version 0.2.0

Next.js educational platform with gamification, subscription management, and real-time features
for pre-university students preparing for university entrance exams (PAES).

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless database & functions)
- **Auth**: Clerk (authentication & user management)
- **Payments**: Stripe integration via Clerk
- **Real-time**: Zoom SDK for virtual classrooms
- **UI Components**: Radix UI, Lucide React icons, Framer Motion
- **Charts**: Recharts for analytics and progress visualization
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel with automated CI/CD
- **Database**: Convex with real-time subscriptions

## 📁 Project Structure

```bash
├── app/                 # Next.js app directory
│   ├── api/            # API routes (Zoom signature)
│   ├── dashboard/      # Main dashboard pages
│   └── [auth]/         # Authentication pages
├── components/         # Reusable UI components
├── convex/            # Database functions & schemas
├── lib/               # Core utilities & configurations
└── public/            # Static assets
```

## 🔧 Development Setup

### Prerequisites

- Node.js 20.x
- pnpm package manager
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd preuniversitario

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Configuration

Required environment variables (see `VERCEL_DEPLOYMENT_README.md` for details):

- Clerk authentication keys
- Convex deployment URL
- Zoom SDK credentials
- Stripe payment configuration

## 📚 Key Features

- **🎮 Comprehensive Gamification**: Daily missions, achievements, rewards shop, leaderboards, study groups, global competitions
- **📊 Advanced Progress Tracking**: Spaced repetition, personalized study plans, detailed analytics,
  weak/strong subject identification
- **🎥 Virtual Classrooms**: Zoom SDK integration with meeting scheduling, RSVPs, and real-time collaboration
- **💳 Subscription Management**: Stripe-powered billing with trial periods, plan upgrades, and payment tracking
- **👥 Social Learning**: Study groups, friend systems, group challenges, collaborative competitions
- **📚 Rich Content Library**: Interactive quizzes, mock exams, video lessons, PAES test preparation
- **🏆 Rewards System**: Unlockable themes, avatars, titles, badges, perks, and customization options
- **⚡ Real-time Features**: Live updates, notifications, instant feedback, and collaborative study sessions

## 🏗️ Architecture Patterns

- **Error Handling**: Comprehensive system with boundaries and fallbacks
- **Component Enhancement**: HOCs for error handling and loading states
- **State Management**: Convex for server state, React hooks for client state
- **API Design**: RESTful routes with TypeScript validation

## 🔍 Core Modules

| Module | Purpose | Key Files |
|--------|---------|-----------|
| **Authentication** | User management & Clerk webhooks | `convex/auth.config.ts`, Clerk integration |
| **Payments** | Subscription & billing processing | `convex/paymentAttempts.ts`, Stripe webhooks |
| **Content** | Educational materials & quizzes | `convex/content.ts`, `lib/paes-manager.ts`, PAES data |
| **Gamification** | Rewards, missions & progression | `convex/rewardsSystem.ts`, `components/DailyMissions.tsx` |
| **Progress** | Study tracking & spaced repetition | `convex/progress.ts`, `convex/spacedRepetition.ts` |
| **Social** | Study groups & competitions | `convex/socialFeatures.ts`, `components/social/` |
| **Meetings** | Zoom integration & scheduling | `app/api/zoom/`, `components/zoom/`, `convex/meetings.ts` |
| **Analytics** | Dashboard & user statistics | `convex/dashboard.ts`, `convex/userStats.ts` |

## 📋 Development Workflow

1. **Local Development**: Use `pnpm dev` for hot reloading
2. **Database Changes**: Update Convex schema, run `npx convex deploy`
3. **Version Management**: Use version scripts to signal releases (see Version Management below)
4. **Deployment**: Push to main branch triggers Vercel deployment
5. **Testing**: Manual testing with error scenarios (see `ERROR_HANDLING_SYSTEM.md`)

## 🔢 Version Management

This project uses an automated version tracking system integrated with the `gg` git automation tool:

### Creating Version Signals

```bash
# For bug fixes (patch: 0.2.0 → 0.2.1)
npm run version:patch "Fixed critical login bug"

# For new features (minor: 0.2.0 → 0.3.0)
npm run version:minor "Added new dashboard analytics"

# For breaking changes (major: 0.2.0 → 1.0.0)
npm run version:major "Complete UI redesign"
```

### How It Works

1. **Signal Creation**: Version scripts create `.version-signal` files with increment type and message
2. **Auto-Processing**: Git pre-commit hooks automatically process signals during `gg` runs
3. **Version Updates**: `package.json` and `VERSION.md` are updated with new version and changelog entry
4. **Clean Commits**: Signals are removed after processing, keeping commits clean

### Files Involved

- `VERSION.md`: Auto-generated changelog with version history
- `version-signal.js`: Creates version increment signals
- `version-processor.js`: Processes signals and updates files
- `.git/hooks/pre-commit`: Automatically runs processor before commits

## 📖 Documentation

- `VERCEL_DEPLOYMENT_README.md`: Deployment configuration
- `ERROR_HANDLING_SYSTEM.md`: Error handling architecture
- `convex/README.md`: Database function patterns
- `convex/clerk-webhook-events-catalog.md`: Webhook event schemas

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Implement error boundaries for new components
3. Test payment flows thoroughly
4. Update documentation for architectural changes
 
  
   
