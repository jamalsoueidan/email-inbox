import { pick } from "convex-helpers";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { Email } from "./tables/emails";

const http = httpRouter();

http.route({
  path: "/postEmail",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body: Doc<"emails"> = await request.json();
    const keys = Object.keys(Email.withoutSystemFields);

    const emailId = await ctx.runMutation(
      internal.email.create,
      pick(body, keys as any) as any
    );

    await ctx.scheduler.runAfter(0, internal.openai.run, { emailId });

    return new Response(null, {
      status: 200,
    });
  }),
});

export default http;
