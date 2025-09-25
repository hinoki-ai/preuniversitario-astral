type PaidPlan = string;

type PlanMetadata = {
  plan?: string | null;
  trialEndsAt?: string | number | null;
};

export type MembershipLike = {
  organization?: {
    publicMetadata?: PlanMetadata | null | undefined;
  } | null;
};

function normalizePlans(envValue?: string | null): PaidPlan[] {
  if (!envValue) return [];
  return envValue
    .split(',')
    .map(plan => plan.trim())
    .filter(Boolean);
}

function coerceTrialEndsAt(raw: unknown): number | undefined {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : undefined;
  }

  if (typeof raw === 'string') {
    const numeric = Number(raw);
    if (!Number.isNaN(numeric) && numeric > 1_000_000_000) {
      return numeric;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return Math.floor(parsed.getTime() / 1000);
    }
  }

  return undefined;
}

function extractPlan(metadata: PlanMetadata | null | undefined): string | undefined {
  const plan = metadata?.plan;
  return typeof plan === 'string' ? plan : undefined;
}

function organizationPlan(membership: MembershipLike | null | undefined): string | undefined {
  if (!membership?.organization) return undefined;
  const metadata = membership.organization.publicMetadata as PlanMetadata | null | undefined;
  return extractPlan(metadata);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMembershipLike(value: unknown): value is MembershipLike {
  if (!isRecord(value)) return false;
  if (!('organization' in value)) return false;
  const organization = (value as { organization?: unknown }).organization;
  return organization === null || isRecord(organization);
}

export function toMembershipArray(value: unknown): MembershipLike[] {
  if (Array.isArray(value)) {
    return value.filter(isMembershipLike);
  }

  if (isRecord(value) && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: unknown[] }).data.filter(isMembershipLike);
  }

  return [];
}

export function parsePaidPlans(envValue?: string | null): PaidPlan[] {
  return normalizePlans(envValue ?? process.env.NEXT_PUBLIC_CLERK_PAID_PLANS ?? '');
}

export function isPaidPlan(
  plan: string | null | undefined,
  paidPlans: readonly PaidPlan[]
): boolean {
  if (!plan || plan === 'free_user' || plan === 'trial_user') {
    return false;
  }

  return paidPlans.length === 0 ? true : paidPlans.includes(plan);
}

export function hasActiveTrial(
  plan: string | null | undefined,
  trialEndsAt: number | undefined,
  nowInSeconds: number
): boolean {
  return plan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > nowInSeconds;
}

export function resolveAccessState(options: {
  plan?: string | null;
  trialEndsAt?: unknown;
  memberships?: readonly MembershipLike[] | null | undefined;
  paidPlans?: readonly PaidPlan[];
  nowInSeconds?: number;
}): {
  paidPlans: readonly PaidPlan[];
  plan: string | null;
  trialEndsAt: number | undefined;
  hasPaidPlan: boolean;
  hasMembershipPaidPlan: boolean;
  hasActiveTrial: boolean;
  hasAccess: boolean;
} {
  const paidPlans = options.paidPlans ? [...options.paidPlans] : parsePaidPlans();
  const nowInSeconds = options.nowInSeconds ?? Math.floor(Date.now() / 1000);

  const plan = options.plan ?? null;
  const trialEndsAt = coerceTrialEndsAt(options.trialEndsAt);

  const hasPaidPlan = isPaidPlan(plan, paidPlans);

  const hasMembershipPaidPlan = Boolean(
    options.memberships?.some(membership => isPaidPlan(organizationPlan(membership), paidPlans))
  );

  const activeTrial = hasActiveTrial(plan, trialEndsAt, nowInSeconds);

  const hasAccess = hasPaidPlan || hasMembershipPaidPlan || activeTrial;

  return {
    paidPlans,
    plan,
    trialEndsAt,
    hasPaidPlan,
    hasMembershipPaidPlan,
    hasActiveTrial: activeTrial,
    hasAccess,
  };
}

export type AccessState = ReturnType<typeof resolveAccessState>;
