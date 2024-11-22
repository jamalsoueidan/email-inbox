import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Collection = Table("collections", {
  name: v.string(),
  emails: v.array(v.string()),
  lastUpdated: v.number(),
});
