"use node";
import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

if (!process.env.OPENAPI) {
  throw new Error(
    "Missing OPENAI in environment variables.\n" +
      "Set it in the project settings in the Convex dashboard:\n" +
      "    npx convex dashboard\n or https://dashboard.convex.dev"
  );
}

export const create = internalAction({
  args: {},
  handler: async () => {
    const openai = new OpenAI({ apiKey: process.env.OPENAPI });
    return openai.beta.threads.create({});
  },
});

export const run = internalAction({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.runQuery(internal.email.get, { _id: args.emailId });
    if (!email?.From) {
      throw new ConvexError("no email found");
    }

    const conversation = await ctx.runQuery(internal.conversation.getByFrom, {
      from: email?.From,
    });

    if (!conversation) {
      throw new ConvexError(`ignore this email ${email.From}`);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAPI });

    await openai.beta.threads.messages.create(conversation.threadId, {
      role: "user",
      content: email.TextBody,
    });

    const stream = await openai.beta.threads.runs.stream(
      conversation.threadId,
      {
        assistant_id: "asst_ealYafLJtsJkNM9LkK74PGly",
      }
    );

    for await (const event of stream) {
      if (event.event === "thread.message.completed") {
        const content = event.data.content[0];
        if (content.type === "text") {
          const response = JSON.parse(content.text.value) as {
            shortenEmail: string;
            choices: Array<{
              shortResponse: string;
              longResponse: string;
            }>;
          };
          await ctx.runMutation(internal.message.create, {
            shortenEmail: response.shortenEmail,
            choices: response.choices,
            email: args.emailId,
            conversation: conversation._id,
          });
        }
      }
    }
  },
});
