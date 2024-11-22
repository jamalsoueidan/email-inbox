import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
("use node");

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

export const runEmail2Message = internalAction({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.runQuery(internal.email.get, { _id: args.emailId });
    if (!email?.from) {
      throw new ConvexError("no email found");
    }

    const conversation = await ctx.runQuery(internal.conversation.getByFrom, {
      from: email?.from,
    });

    if (!conversation) {
      console.log(`ignore this email ${email.from}`);
      return;
    }

    let content: string = email.textBody;

    if (!email.textBodyRun) {
      // run openai to remove any replies in the text body
      content = await ctx.runAction(internal.openai.runEmailHtml2Text, {
        htmlBody: email.textBody,
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAPI });

    const message = await openai.beta.threads.messages.create(
      conversation.threadId,
      {
        role: "user",
        content,
      }
    );

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

          await ctx.runMutation(internal.email.finishedRun, args);

          return response;
        }
      }
    }
  },
});

export const runEmailHtml2Text = internalAction({
  args: {
    htmlBody: v.string(),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAPI });

    const completion: OpenAI.Chat.Completions.ChatCompletion =
      await openai.chat.completions.create({
        model: "o1-mini",
        messages: [
          {
            role: "user",
            content: `
            You are a helpful assistant. Please extract only the **most recent email reply** from the following conversation.

- Start from the most recent salutation or greeting (e.g., "Hi [Name]", "Hej", etc.).
- Ignore any quoted text from previous replies (indicated by lines like "On [date], [name] wrote:" or "---- Original Message ----").
- Remove all disclaimers, footers, and privacy notices.
- If the email already contains only the most recent reply, return it unchanged.
- Please clean the provided text by removing unnecessary markers such as backticks.
- Ensure the text retains its natural formatting, including paragraph breaks and whitespace, but remove any symbols or artifacts not part of the meaningful content.

Here is the email content:
${args.htmlBody}`,
          },
        ],
      });

    return completion.choices[0].message.content || "";
  },
});
