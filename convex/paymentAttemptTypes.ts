import { v } from 'convex/values';

// Reusable validators for payment attempt data
export const PAYMENT_ATTEMPT_VALIDATORS = {
  billingDate: v.number(),
  chargeType: v.string(),
  createdAt: v.number(),
  failedAt: v.optional(v.number()),
  failedReason: v.optional(
    v.object({
      code: v.string(),
      declineCode: v.optional(v.string()),
    })
  ),
  invoiceId: v.string(),
  paidAt: v.optional(v.number()),
  paymentId: v.string(),
  statementId: v.string(),
  status: v.string(),
  updatedAt: v.number(),
  payer: v.object({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    userId: v.string(),
  }),
  paymentSource: v.object({
    cardType: v.string(),
    last4: v.string(),
  }),
  subscriptionItems: v.array(
    v.object({
      amount: v.object({
        amount: v.number(),
        amountFormatted: v.string(),
        currency: v.string(),
        currencySymbol: v.string(),
      }),
      plan: v.object({
        id: v.string(),
        name: v.string(),
        slug: v.string(),
        amount: v.number(),
        currency: v.string(),
        period: v.string(),
        interval: v.number(),
      }),
      status: v.string(),
      periodStart: v.number(),
      periodEnd: v.number(),
    })
  ),
  totals: v.object({
    grandTotal: v.object({
      amount: v.number(),
      amountFormatted: v.string(),
      currency: v.string(),
      currencySymbol: v.string(),
    }),
    subtotal: v.object({
      amount: v.number(),
      amountFormatted: v.string(),
      currency: v.string(),
      currencySymbol: v.string(),
    }),
    taxTotal: v.object({
      amount: v.number(),
      amountFormatted: v.string(),
      currency: v.string(),
      currencySymbol: v.string(),
    }),
  }),
};

// Combined validator for the complete payment attempt data
export const paymentAttemptDataValidator = v.object(PAYMENT_ATTEMPT_VALIDATORS);

// Schema validator (includes the userId link)
export const paymentAttemptSchemaValidator = v.object({
  ...PAYMENT_ATTEMPT_VALIDATORS,
  userId: v.optional(v.id('users')),
});

// Helper function to transform webhook data to our format
export function transformWebhookData(data: any) {
  return {
    billingDate: data.billing_date,
    chargeType: data.charge_type,
    createdAt: data.created_at,
    failedAt: data.failed_at || undefined,
    failedReason: data.failed_reason || undefined,
    invoiceId: data.invoice_id,
    paidAt: data.paid_at || undefined,
    paymentId: data.payment_id,
    statementId: data.statement_id,
    status: data.status,
    updatedAt: data.updated_at,
    payer: {
      email: data.payer.email,
      firstName: data.payer.first_name,
      lastName: data.payer.last_name,
      userId: data.payer.user_id,
    },
    paymentSource: {
      cardType: data.payment_source.card_type,
      last4: data.payment_source.last4,
    },
    subscriptionItems: data.subscription_items.map((item: any) => ({
      amount: {
        amount: item.amount.amount,
        amountFormatted: item.amount.amount_formatted,
        currency: item.amount.currency,
        currencySymbol: item.amount.currency_symbol,
      },
      plan: {
        id: item.plan.id,
        name: item.plan.name,
        slug: item.plan.slug,
        amount: item.plan.amount,
        currency: item.plan.currency,
        period: item.plan.period,
        interval: item.plan.interval,
      },
      status: item.status,
      periodStart: item.period_start,
      periodEnd: item.period_end,
    })),
    totals: {
      grandTotal: {
        amount: data.totals.grand_total.amount,
        amountFormatted: data.totals.grand_total.amount_formatted,
        currency: data.totals.grand_total.currency,
        currencySymbol: data.totals.grand_total.currency_symbol,
      },
      subtotal: {
        amount: data.totals.subtotal.amount,
        amountFormatted: data.totals.subtotal.amount_formatted,
        currency: data.totals.subtotal.currency,
        currencySymbol: data.totals.subtotal.currency_symbol,
      },
      taxTotal: {
        amount: data.totals.tax_total.amount,
        amountFormatted: data.totals.tax_total.amount_formatted,
        currency: data.totals.tax_total.currency,
        currencySymbol: data.totals.tax_total.currency_symbol,
      },
    },
  };
}
