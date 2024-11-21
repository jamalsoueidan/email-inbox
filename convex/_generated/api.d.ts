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
import type * as conversation from "../conversation.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as message from "../message.js";
import type * as openai from "../openai.js";
import type * as tables_conversation from "../tables/conversation.js";
import type * as tables_emails from "../tables/emails.js";
import type * as tables_message from "../tables/message.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  conversation: typeof conversation;
  email: typeof email;
  http: typeof http;
  message: typeof message;
  openai: typeof openai;
  "tables/conversation": typeof tables_conversation;
  "tables/emails": typeof tables_emails;
  "tables/message": typeof tables_message;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
