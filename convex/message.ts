import { internalMutation } from "./_generated/server";
import { Message } from "./tables/message";

export const create = internalMutation({
  args: Message.withoutSystemFields,
  handler: async (ctx, args) => ctx.db.insert("messages", args),
});
