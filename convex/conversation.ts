import { pick } from "convex-helpers";
import { internalMutation, internalQuery } from "./_generated/server";
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
