import { pick } from "convex-helpers";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { Email } from "./tables/emails";
const http = httpRouter();

http.route({
  path: "/postEmail",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    await ctx.runMutation(
      internal.email.create,
      pick(body, Object.keys(Email.withoutSystemFields))
    );

    return new Response(null, {
      status: 200,
    });
  }),
});

export default http;
