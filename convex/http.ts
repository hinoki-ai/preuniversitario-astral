import type { WebhookEvent } from '@clerk/backend';
import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';

import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { transformWebhookData } from './paymentAttemptTypes';

const http = httpRouter();

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response('Error occured', { status: 400 });
    }
    switch ((event as any).type) {
      case 'user.created': // intentional fallthrough
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data as any,
        });
        if ((event as any).type === 'user.created') {
          const data: any = event.data;
          const publicMeta = (data?.public_metadata as any) || {};
          const hasPlan = !!publicMeta.plan && publicMeta.plan !== 'free_user';
          const hasTrialEnds = !!publicMeta.trialEndsAt;
          if (!hasPlan && !hasTrialEnds) {
            const now = Math.floor(Date.now() / 1000);
            const trialEndsAt = now + 7 * 24 * 3600;
            await ctx.runMutation(internal.users.setTrialByExternalId, {
              externalId: data.id,
              trialEndsAt,
            });
          }
        }
        break;

      case 'user.deleted': {
        const clerkUserId = (event.data as any).id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }

      case 'paymentAttempt.updated': {
        const paymentAttemptData = transformWebhookData((event as any).data);
        await ctx.runMutation(internal.paymentAttempts.savePaymentAttempt, {
          paymentAttemptData,
        });
        break;
      }
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.active':
      case 'subscription.past_due': {
        const data: any = (event as any).data;
        const payerId: string | undefined = data?.payer_id;
        const items: any[] = Array.isArray(data?.items) ? data.items : [];
        const planSlug: string | undefined = items[0]?.plan?.slug;
        if (payerId && planSlug) {
          await ctx.runMutation(internal.users.setPlanByExternalId, {
            externalId: payerId,
            plan: planSlug,
          });
        }
        break;
      }

      default:
      // Silently ignore unhandled webhook events
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixheaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp');!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error('Error verifying webhook event', error);
    return null;
  }
}

export default http;
