import { pick } from "convex-helpers";
import { httpRouter } from "convex/server";
import ms from "ms";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { Email } from "./tables/emails";

const http = httpRouter();

function lowercaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    // If it's an array, process each element
    return obj.map(lowercaseKeys);
  } else if (obj !== null && typeof obj === "object") {
    // If it's an object, transform its keys
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.charAt(0).toLowerCase() + key.slice(1), // Lowercase the first letter of the key
        lowercaseKeys(value), // Recursively handle the value
      ])
    );
  }
  return obj; // Return the value as-is if it's not an array or object
}

http.route({
  path: "/postEmail",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    /*[
      {
        Attachments: [],
        Date: "",
        Domain: "",
        From: "",
        FromName: "",
        HtmlBody: "",
        Nickname: "",
        Subject: "",
        TextBody: "",
      },
    ];*/

    const body: Doc<"emails"> = lowercaseKeys(await request.json());

    console.log(body);

    const keys = Object.keys(Email.withoutSystemFields);

    const [nickname, domain] = body.from.split("@");
    const date = new Date(body.date);
    const emailId = await ctx.runMutation(
      internal.email.create,
      pick(
        { ...body, nickname, domain, date: date.getTime() },
        keys as any
      ) as any
    );

    await ctx.scheduler.runAfter(
      0,
      internal.collection.ensureCollectionForEmail,
      {
        emailId,
      }
    );

    await ctx.scheduler.runAfter(0, internal.email.runEmailMissingTextBody, {
      emailId,
    });

    const seconds = ms(`${15}s`);
    await ctx.scheduler.runAfter(seconds, internal.openai.runEmail2Message, {
      emailId,
    });

    return new Response(null, {
      status: 200,
    });
  }),
});

export default http;
