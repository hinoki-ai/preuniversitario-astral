import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponseBuilder } from '@/lib/core/api-response';
import { AppError, ErrorCode } from '@/lib/core/error-system';
import { resolveAccessState, toMembershipArray, type MembershipLike } from '@/lib/subscription';
import { z } from 'zod';

// Validation schema for request body
const requestSchema = z.object({
  meetingNumber: z.string().min(1, 'Meeting number is required'),
  role: z.number().min(0).max(1).default(0), // 0 = attendee, 1 = host
});

function base64Url(input: Buffer | string) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function signHmacSha256(message: string, secret: string) {
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', secret).update(message).digest();
}

async function validateUserAccess(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const publicMetadata = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const plan = typeof publicMetadata.plan === 'string' ? publicMetadata.plan : undefined;
  let memberships: MembershipLike[] = [];

  try {
    const membershipList = await client.users.getOrganizationMembershipList({ userId });
    memberships = toMembershipArray(membershipList);
  } catch (error) {
    console.warn('Failed to check organization memberships:', error);
  }

  const accessState = resolveAccessState({
    plan,
    trialEndsAt: publicMetadata.trialEndsAt,
    memberships,
  });

  if (!accessState.hasAccess) {
    throw AppError.paymentRequired('Payment required for Zoom integration');
  }

  return user;
}

async function generateZoomSignature(meetingNumber: string, role: number) {
  const sdkKey = process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY;
  const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;

  if (!sdkKey || !sdkSecret) {
    throw AppError.internal('Zoom Meeting SDK configuration missing');
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

  const encHeader = base64Url(JSON.stringify(header));
  const encPayload = base64Url(JSON.stringify(payload));
  const toSign = `${encHeader}.${encPayload}`;
  const signature = base64Url(await signHmacSha256(toSign, sdkSecret));
  const jwt = `${toSign}.${signature}`;

  return { signature: jwt, sdkKey };
}

export async function POST(req: Request) {
  try {
    // Authenticate user
    const authResult = await auth();
    if (!authResult.userId) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    const userId = authResult.userId;

    // Validate user access
    await validateUserAccess(userId);

    // Parse and validate request body
    const body = await req.json().catch(() => {
      throw AppError.validation('Invalid JSON in request body');
    });
    
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseBuilder.validationError(validationResult.error);
    }

    const { meetingNumber, role } = validationResult.data;

    // Generate Zoom signature
    const result = await generateZoomSignature(meetingNumber, role);

    return ApiResponseBuilder.success(result);
  } catch (error) {
    console.error('Error generating Zoom signature:', error);
    return ApiResponseBuilder.error(error instanceof Error ? error : 'Internal server error');
  }
}
