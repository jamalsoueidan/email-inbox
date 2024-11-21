import { pick } from "convex-helpers";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import ms from "ms";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { Email } from "./tables/emails";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const create = internalMutation({
  args: Email.withoutSystemFields,
  handler: async (ctx, args) => ctx.db.insert("emails", args),
});

export const getAllEmails = internalQuery({
  args: { from: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("emails")
      .withIndex("byFrom", (q) => q.eq("From", args.from))
      .collect(),
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

      await ctx.scheduler.runAfter(0, internal.email.runAllEmails, {
        from: email.From,
      });
    }
  },
});

export const finishedRun = internalMutation({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    ctx.db.patch(args.emailId, {
      Run: true,
      RunAt: Date.now(),
    });
  },
});

export const updateTextBody = internalMutation({
  args: {
    emailId: v.id("emails"),
    textBody: v.string(),
  },
  handler: async (ctx, args) => {
    ctx.db.patch(args.emailId, {
      TextBody: args.textBody,
      TextBodyRun: true,
      TextBodyRunAt: Date.now(),
    });
  },
});

export const runEmailMissingTextBody = internalAction({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const email: Doc<"emails"> = await ctx.runQuery(internal.email.get, {
      _id: args.emailId,
    });
    if (!email?.From) {
      throw new ConvexError("No email found");
    }

    if (email?.TextBody || email?.TextBodyRun) {
      console.log(`Already have textBody ${email.From}`);
      return;
    }

    const textBody: string = await ctx.runAction(
      internal.openai.runEmailHtml2Text,
      {
        htmlBody: email.HtmlBody,
      }
    );

    console.log(args.emailId, textBody);
    await ctx.runMutation(internal.email.updateTextBody, {
      emailId: args.emailId,
      textBody: textBody || "",
    });
  },
});

export const runAllEmails = internalAction({
  args: { from: v.string() },
  handler: async (ctx, args) => {
    const emails = await ctx.runQuery(internal.email.getAllEmails, args);
    for (const [index, e] of emails.entries()) {
      const seconds = ms(`${index * 15}s`);
      console.log(`running email ${seconds} of ${e._id}`);
      await ctx.scheduler.runAfter(seconds, internal.openai.runEmail2Message, {
        emailId: e._id,
      });
    }
  },
});
