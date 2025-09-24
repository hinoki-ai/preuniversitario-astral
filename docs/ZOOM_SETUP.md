Zoom Meeting SDK Integration — Setup Guide
=========================================

Overview
- Paid-only access to an embedded Zoom client inside the dashboard.
- Server-side signature endpoint protects access and enforces plan.

Environment Variables
- Add to `.env.local` (or your Vercel project’s env vars):
  - `NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY` = Your Zoom Meeting SDK Key (publishable)
  - `ZOOM_MEETING_SDK_SECRET` = Your Zoom Meeting SDK Secret (server-only)

Zoom App Configuration (Marketplace)
1) Create a Meeting SDK app in Zoom Marketplace.
2) Copy SDK Key/Secret into env vars above.
3) Add your domains to the SDK “Allowlist/Whitelist”:
   - Development: http://localhost:3000
   - Production: https://your-domain.com
4) Enable HD video in the host’s Zoom account settings for best quality.

Clerk Billing / Plan Gating
- The app gates Zoom access for users with any paid plan.
- It treats `plan: 'free_user'` as free; anything else is paid.
- Ensure Clerk updates `user.publicMetadata.plan` or the organization’s `publicMetadata.plan`.
- The client UI uses `Protect` with `has({ plan: 'free_user' })` to guard the page.
- The server API verifies plan via Clerk’s backend, returning 402 for unpaid.

Teacher Role
- To enable the teacher panel, set `user.publicMetadata.role` to `teacher` (or `admin`).
- The Convex `users` table mirrors this field via the Clerk webhook.
- Teachers can create classes by entering an existing Zoom Meeting ID + Passcode.

Usage
1) Ensure you are signed-in and have a paid plan.
2) Navigate to Dashboard → “Clases en Vivo (Zoom)”.
3) Enter Meeting ID and Passcode shared by the instructor.
4) Click “Unirse a la clase”.

Notes
- 40-minute limit is based on the host’s Zoom plan (Basic). Quality depends on Zoom settings and network.
- The Meeting SDK version is pinned in `components/zoom/ZoomJoinClient.tsx` and can be bumped if needed.

Troubleshooting
- 401/402 from `/api/zoom/signature`: sign-in or ensure your plan is paid.
- SDK not loading: confirm domain allowlist and correct SDK Key/Secret.
- “Join failed”: verify Meeting ID/Passcode and that the meeting is active.
