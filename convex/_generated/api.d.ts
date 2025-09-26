/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as content from "../content.js";
import type * as dailyMissions from "../dailyMissions.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as lessonAnnotations from "../lessonAnnotations.js";
import type * as meetings from "../meetings.js";
import type * as mockExams from "../mockExams.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as progress from "../progress.js";
import type * as quizzes from "../quizzes.js";
import type * as rewardsSystem from "../rewardsSystem.js";
import type * as seed from "../seed.js";
import type * as shared from "../shared.js";
import type * as socialFeatures from "../socialFeatures.js";
import type * as spacedRepetition from "../spacedRepetition.js";
import type * as studyPlan from "../studyPlan.js";
import type * as userStats from "../userStats.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  content: typeof content;
  dailyMissions: typeof dailyMissions;
  dashboard: typeof dashboard;
  http: typeof http;
  lessonAnnotations: typeof lessonAnnotations;
  meetings: typeof meetings;
  mockExams: typeof mockExams;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  progress: typeof progress;
  quizzes: typeof quizzes;
  rewardsSystem: typeof rewardsSystem;
  seed: typeof seed;
  shared: typeof shared;
  socialFeatures: typeof socialFeatures;
  spacedRepetition: typeof spacedRepetition;
  studyPlan: typeof studyPlan;
  userStats: typeof userStats;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
