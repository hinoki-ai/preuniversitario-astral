# Deployment to Vercel

This guide explains how to deploy your Preuniversitario Astral application to Vercel.

## Environment Variables Required

You'll need to configure the following environment variables in your Vercel project settings:

### Clerk Authentication (Required)

```env
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=your_clerk_frontend_api_url
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_JS_URL=your_clerk_js_url
NEXT_PUBLIC_CLERK_JS_VERSION=your_clerk_js_version
NEXT_PUBLIC_CLERK_PROXY_URL=your_clerk_proxy_url
NEXT_PUBLIC_CLERK_DOMAIN=your_clerk_domain
NEXT_PUBLIC_CLERK_IS_SATELLITE=false
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=false
NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG=false
NEXT_PUBLIC_CLERK_PAID_PLANS=premium,pro
NEXT_PUBLIC_CLERK_CHECKOUT_CONTINUE_URL=/dashboard/payment-gated
CLERK_API_VERSION=v1
CLERK_MACHINE_SECRET_KEY=your_clerk_machine_secret_key
CLERK_ENCRYPTION_KEY=your_clerk_encryption_key
```

### Convex Backend (Required)

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### Zoom Integration (Required for Zoom features)

```env
NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY=your_zoom_sdk_key
ZOOM_MEETING_SDK_SECRET=your_zoom_sdk_secret
```

### Redis/Upstash (Optional - for caching/subscriptions)

```env
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

### Vercel Analytics (Optional)

```env
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:

   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all the required environment variables listed above

5. **Redeploy** (if you added environment variables after initial deployment):

   ```bash
   vercel --prod
   ```

## Important Notes

- Make sure all required environment variables are set before deployment
- The application uses Convex as the backend, so ensure your Convex deployment is properly configured
- Clerk authentication is required for the application to function
- Zoom integration requires valid Zoom SDK credentials
- The application is configured to deploy to the `fra1` region (Frankfurt)

## Troubleshooting

If you encounter any issues during deployment:

1. Check that all environment variables are properly set
2. Ensure your Convex backend is deployed and accessible
3. Verify that your Clerk application is properly configured
4. Check the build logs in the Vercel dashboard for any compilation errors
