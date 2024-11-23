import { asyncMap, pick } from "convex-helpers";
import { filter } from "convex-helpers/server/filter";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { Collection } from "./tables/collections";

export const create = internalMutation({
  args: Collection.withoutSystemFields,
  handler: async (ctx, args) => ctx.db.insert("collections", args),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collections")
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await asyncMap(collections.page, async (c) => {
      const email = await ctx.db.get(c.lastEmail);
      if (!email) {
        throw new ConvexError(`No email found for ${c._id} collection`);
      }
      const fields = pick(email, [
        "fromName",
        "from",
        "textBodyRun",
        "subject",
        "textBody",
        "date",
        "markedAsRead",
        "htmlBody",
      ]);

      return {
        ...c,
        email: fields,
      };
    });

    return {
      ...collections,
      page,
    };
  },
});

export const get = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);

    if (!collection) {
      throw new ConvexError("collection not exist");
    }

    const email = await ctx.db.get(collection.lastEmail);
    return {
      ...collection,
      email,
    };
  },
});

export const paginate = query({
  args: {
    id: v.id("collections"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);

    if (!collection) {
      throw new ConvexError("collection not exist");
    }

    const email = await ctx.db
      .query("emails")
      .filter((q) => {
        const emailConditions = collection.emails.map((email) =>
          q.eq(q.field("from"), email)
        );

        const emailDomain = collection.emails.map((email) =>
          q.eq(q.field("domain"), email)
        );

        return q.or(...emailConditions, ...emailDomain);
      })
      .order("desc")
      .paginate(args.paginationOpts);

    return email;
  },
});

export const search = internalQuery({
  args: { from: v.string() },
  handler: async (ctx, args) => {
    const domain = args.from.split("@")[1];
    return filter(
      ctx.db.query("collections"),
      (post) => post.emails.includes(args.from) || post.emails.includes(domain)
    ).take(10);
  },
});

export const ensureCollectionForEmail = internalAction({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    const email = await ctx.runQuery(internal.email.get, { _id: args.emailId });

    const collections = await ctx.runQuery(internal.collection.search, {
      from: email.from,
    });

    if (!collections.length) {
      await ctx.runMutation(internal.collection.create, {
        name: email.fromName || email.from,
        emails: [email.from],
        lastEmail: args.emailId,
        lastUpdated: Date.now(),
      });
    } else {
      await Promise.all(
        collections.map((c) =>
          ctx.runMutation(internal.collection.update, {
            id: c._id,
            lastEmail: args.emailId,
          })
        )
      );
    }
  },
});

export const update = internalMutation({
  args: {
    id: v.id("collections"),
    lastEmail: v.id("emails"),
  },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, {
      lastEmail: args.lastEmail,
      lastUpdated: Date.now(),
    }),
});
