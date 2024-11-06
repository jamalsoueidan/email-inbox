import { internalMutation, query } from "./_generated/server";
import { Email } from "./tables/emails";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("emails").collect();
  },
});

export const create = internalMutation({
  args: Email.withoutSystemFields,
  handler: async (ctx, args) => {
    return await ctx.db.insert("emails", args);
  },
});
