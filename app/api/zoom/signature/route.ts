import { auth, clerkClient } from '@clerk/nextjs/server';

import { ApiResponse, ErrorFactory, withErrorHandler } from '@/lib/errors';
import { resolveAccessState, toMembershipArray, type MembershipLike } from '@/lib/subscription';

function base64url(input: Buffer | string) {
  const buff = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buff.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function signHMACSHA256(message: string, secret: string) {
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', secret).update(message).digest();
}

async function validateUserAccess(userId: string) {
  const user = await clerkClient().users.getUser(userId);
  const publicMetadata = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const plan = typeof publicMetadata.plan === 'string' ? publicMetadata.plan : undefined;

  let memberships: MembershipLike[] = [];
  try {
    const membershipList = await clerkClient().users.getOrganizationMembershipList({ userId });
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
    throw ErrorFactory.authorization('Payment required for Zoom integration');
  }

  return user;
}

async function validateRequestBody(body: any) {
  const meetingNumber = String(body?.meetingNumber || '').trim();
  const role = Number(body?.role ?? 0); // 0 attendee, 1 host

  if (!meetingNumber) {
    throw ErrorFactory.validation('Missing required field: meetingNumber');
  }

  if (Number.isNaN(role) || (role !== 0 && role !== 1)) {
    throw ErrorFactory.validation('Rol inválido: debe ser 0 (asistente) o 1 (anfitrión)');
  }

  return { meetingNumber, role };
}

async function generateZoomSignature(meetingNumber: string, role: number) {
  const sdkKey = process.env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY;
  const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;

  if (!sdkKey || !sdkSecret) {
    throw ErrorFactory.internal('Zoom Meeting SDK configuration missing');
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

  return { signature: jwt, sdkKey };
}

const handler = async (req: Request) => {
  // Authenticate user
  const authResult = await auth();
  if (!authResult.userId) {
    throw ErrorFactory.authentication();
  }

  const userId = authResult.userId;

  // Validate user access
  await validateUserAccess(userId);

  // Parse and validate request body
  const body = await req.json().catch(() => {
    throw ErrorFactory.validation('JSON inválido en el cuerpo de la solicitud');
  });
  const { meetingNumber, role } = await validateRequestBody(body);

  // Generate Zoom signature
  const result = await generateZoomSignature(meetingNumber, role);

  return ApiResponse.success(result, 'Firma de Zoom generada exitosamente');
};

export const POST = withErrorHandler(handler, 'Zoom Signature API');
