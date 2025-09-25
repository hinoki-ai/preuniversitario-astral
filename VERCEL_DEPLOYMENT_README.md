# Vercel Deployment Guide

Preuniversitario Astral deployment configuration for Vercel platform.

## Environment Variables

**Legend:** ✅ Required, ❌ Optional

| Category | Variable | Description | Required |
|----------|----------|-------------|----------|
| **Clerk Auth** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for frontend | ✅ |
| | `CLERK_SECRET_KEY` | Clerk secret key for server-side operations | ✅ |
| | `CLERK_WEBHOOK_SECRET` | Webhook secret for auth events | ✅ |
| | `NEXT_PUBLIC_CLERK_PAID_PLANS` | JSON string of paid plan configs | ✅ |
| **Zoom** | `NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY` | Zoom Meeting SDK Key | ❌ |
| | `ZOOM_MEETING_SDK_SECRET` | Zoom Meeting SDK Secret | ❌ |
| | `NEXT_PUBLIC_ZOOM_DEMO_MODE` | Set to 'false' for production | ❌ |
| **Storage** | `KV_REST_API_URL` | Vercel KV REST API URL | ✅ |
| | `KV_REST_API_TOKEN` | Vercel KV REST API Token | ✅ |
| **Database** | `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | ✅ |
| **App Config** | `NEXT_PUBLIC_APP_URL` | Application base URL | ✅ |
| **Feature Flags** | `NEXT_PUBLIC_ENABLE_ZOOM` | Enable Zoom features ('true'/'false') | ❌ |
| | `NEXT_PUBLIC_ENABLE_MOCK_EXAMS` | Enable mock exams ('true'/'false') | ❌ |
| **Analytics** | `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Vercel Analytics ID | ❌ |
| **Runtime** | `NODE_ENV` | Set to 'production' | ✅ |

## Deployment Steps

1. **Repository**: Connect GitHub repository to Vercel
2. **Environment**: Add all required (✅) variables from table above. Optional (❌)
   variables can be omitted if features are not needed.
3. **Build Settings**:
   - Framework: Next.js
   - Node.js Version: 20.x
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next`
4. **Deploy**: Automatic on push to main branch

## Database Deployment

Deploy Convex functions separately:

```bash
npx convex deploy
```

## Configuration Notes

- **Package Manager**: pnpm
- **Node Version**: 20.x
- **CORS**: Configured for API routes
- **Logs**: Console logs removed in production

## Incident History

- **2025-09-25**: Casing regression recovery - Restored variable/type casing in dashboard modules
  (`app/dashboard/*`, `hooks/use-toast.ts`, `lib/subscription.ts`, `convex/userStats.ts`).
  Removed prototype HTML files from deploy target.
