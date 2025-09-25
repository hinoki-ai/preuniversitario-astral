# Vercel Deployment Configuration

This guide outlines all the steps needed to deploy the Preuniversitario Astral app to Vercel.

## Environment Variables Required

Configure these environment variables in your Vercel dashboard:

### Clerk Authentication

- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` - Your Clerk frontend API URL
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret for handling auth events
- `NEXT_PUBLIC_CLERK_PAID_PLANS` - JSON string of paid plan configurations

### Zoom Integration

- `NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY` - Zoom Meeting SDK Key
- `ZOOM_MEETING_SDK_SECRET` - Zoom Meeting SDK Secret
- `NEXT_PUBLIC_ZOOM_DEMO_MODE` - Set to 'false' for production

### Storage (Vercel KV)

- `KV_REST_API_URL` - Vercel KV REST API URL
- `KV_REST_API_TOKEN` - Vercel KV REST API Token

### Convex Database

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL

### Environment

- `NODE_ENV` - Set to 'production'

## Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Configure Environment Variables**: Add all the environment variables listed above
3. **Set Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
4. **Deploy**: Vercel will automatically deploy on push to main branch

## Convex Deployment

Make sure to deploy your Convex functions separately:

```bash
npx convex deploy
```

## Additional Notes

- The app uses pnpm as package manager
- Node.js runtime is set to 20.x
- CORS headers are configured for API routes
- Console logs are automatically removed in production builds
