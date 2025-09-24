import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

function base64url(input: Buffer | string) {
  const buff = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buff.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function signHMACSHA256(message: string, secret: string) {
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', secret).update(message).digest();
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Enforce paid plan on the server (paid or active trial)
    const paidPlansEnv = (process.env.NEXT_PUBLIC_CLERK_PAID_PLANS || '')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    const user = await clerkClient.users.getUser(userId);
    const userPlan = (user.publicMetadata as any)?.plan as string | undefined;
    const trialRaw = (user.publicMetadata as any)?.trialEndsAt as any;
    const nowSec = Math.floor(Date.now() / 1000);
    let trialEndsAt: number | undefined = undefined;
    if (typeof trialRaw === 'number') {
      trialEndsAt = trialRaw;
    } else if (typeof trialRaw === 'string') {
      const n = Number(trialRaw);
      if (!Number.isNaN(n) && n > 1000000000) {
        trialEndsAt = n;
      } else {
        const d = new Date(trialRaw);
        if (!isNaN(d.getTime())) trialEndsAt = Math.floor(d.getTime() / 1000);
      }
    }

    // Helper to check if a plan is considered paid
    const isPaidPlan = (plan?: string | null) => {
      if (!plan) return false;
      if (plan === 'free_user') return false;
      if (plan === 'trial_user') return false; // handled by trial check
      return paidPlansEnv.length > 0 ? paidPlansEnv.includes(plan) : true;
    };

    let hasAccess = isPaidPlan(userPlan);

    // Check org memberships' publicMetadata.plan
    if (!hasAccess) {
      try {
        const memberships = await clerkClient.users.getOrganizationMembershipList({ userId });
        for (const m of (memberships as any).data || memberships) {
          const orgPlan = (m.organization.publicMetadata as any)?.plan as string | undefined;
          if (isPaidPlan(orgPlan)) {
            hasAccess = true;
            break;
          }
        }
      } catch {}
    }

    // Fallback to active trial if any
    if (!hasAccess) {
      const trialActive =
        userPlan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > nowSec;
      if (trialActive) hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Payment required' }, { status: 402 });
    }

    const body = await req.json().catch(() => ({}));
    const meetingNumber = String(body?.meetingNumber || '').trim();
    const role = Number(body?.role ?? 0); // 0 attendee, 1 host

    if (!meetingNumber) {
      return NextResponse.json({ error: 'Missing meetingNumber' }, { status: 400 });
    }
    if (Number.isNaN(role) || (role !== 0 && role !== 1)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const sdkKey = process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY;
    const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;
    if (!sdkKey || !sdkSecret) {
      return NextResponse.json(
        { error: 'Zoom Meeting SDK env vars not configured' },
        { status: 500 }
      );
    }

    // JWT header & payload for Zoom Meeting SDK signature
    const iat = Math.floor(Date.now() / 1000) - 30; // backdate to allow clock skew
    const exp = iat + 60 * 60 * 2; // 2 hours
    const tokenExp = exp; // recommended to match exp

    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sdkKey,
      mn: meetingNumber,
      role,
      iat,
      exp,
      appKey: sdkKey,
      tokenExp,
    };

    const encHeader = base64url(JSON.stringify(header));
    const encPayload = base64url(JSON.stringify(payload));
    const toSign = `${encHeader}.${encPayload}`;
    const signature = base64url(await signHMACSHA256(toSign, sdkSecret));
    const jwt = `${toSign}.${signature}`;

    return NextResponse.json({ signature: jwt, sdkKey });
  } catch (err) {
    console.error('/api/zoom/signature error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
