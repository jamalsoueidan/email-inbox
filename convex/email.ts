import { pick } from "convex-helpers";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { Email } from "./tables/emails";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("emails").collect(),
});

export const create = internalMutation({
  args: Email.withoutSystemFields,
  handler: async (ctx, args) => ctx.db.insert("emails", args),
});

export const get = internalQuery({
  args: pick(Email.withSystemFields, ["_id"]),
  handler: async (ctx, args) => {
    const email = await ctx.db
      .query("emails")
      .withIndex("by_id", (q) => q.eq("_id", args._id))
      .unique();

    if (!email) {
      throw new ConvexError("email not exist");
    }
    return email;
  },
});

export const addEmailToConversation = action({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.runQuery(internal.email.get, { _id: args.emailId });

    const conversation = await ctx.runQuery(internal.conversation.getByFrom, {
      from: email.From,
    });
    if (!conversation) {
      const threadId = await ctx.runAction(internal.openai.create);

      await ctx.runMutation(internal.conversation.create, {
        from: email.From,
        fromName: email.FromName,
        lastDate: Date.now(),
        threadId: threadId.id,
      });
    }
  },
});
