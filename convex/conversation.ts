import { pick } from "convex-helpers";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { Conversation } from "./tables/conversation";

export const getByFrom = internalQuery({
  args: pick(Conversation.withoutSystemFields, ["from"]),
  handler: async (ctx, args) =>
    ctx.db
      .query("conversations")
      .withIndex("byFrom", (q) => q.eq("from", args.from))
      .unique(),
});

export const create = internalMutation({
  args: Conversation.withoutSystemFields,
  handler: async (ctx, args) => ctx.db.insert("conversations", args),
});

export const updateLastDate = internalMutation({
  args: pick(Conversation.withSystemFields, ["_id"]),
  handler: async (ctx, args) => {
    ctx.db.patch(args._id, { lastDate: Date.now() });
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) =>
    ctx.db.query("conversations").order("desc").paginate(args.paginationOpts),
});

export const messages = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) =>
    ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversation", args.id))
      .collect(),
});
