import { filter } from "convex-helpers/server/filter";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { Collection } from "./tables/collections";

export const create = internalMutation({
  args: Collection.withoutSystemFields,
  handler: async (ctx, args) => ctx.db.insert("collections", args),
});

export const list = query({
  args: { from: v.string() },
  handler: (ctx, args) => {
    return ctx.db
      .query("emails")
      .withSearchIndex("search_from", (q) => q.search("from", args.from))
      .take(30);
  },
});

export const search = query({
  args: { from: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return filter(ctx.db.query("emails"), (post) => {
      console.log(post.from, args.from);
      return post.from === args.from;
    }).paginate(args.paginationOpts);
  },
});
