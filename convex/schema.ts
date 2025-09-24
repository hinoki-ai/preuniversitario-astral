import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // Clerk ID, stored in the subject JWT field
      externalId: v.string(),
      // Optional plan and role copied from Clerk public metadata via webhook
      plan: v.optional(v.string()),
      role: v.optional(v.string()), // e.g., 'teacher', 'admin', 'student'
    }).index("byExternalId", ["externalId"]),
    
    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    meetings: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      startTime: v.number(), // epoch seconds
      meetingNumber: v.string(), // hidden for free users
      passcode: v.string(), // hidden for free users
      published: v.boolean(),
      createdBy: v.id("users"),
      createdAt: v.number(), // epoch seconds
    })
      .index("byStartTime", ["startTime"]) // for upcoming queries
      .index("byCreator", ["createdBy"]),
  });
