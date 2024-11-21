import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Email = Table("emails", {
  Run: v.optional(v.boolean()),
  RunAt: v.optional(v.number()),
  Date: v.string(),
  From: v.string(),
  FromName: v.string(),
  HtmlBody: v.string(),
  Subject: v.string(),
  TextBody: v.string(),
  TextBodyRun: v.optional(v.boolean()),
  TextBodyRunAt: v.optional(v.number()),
  Attachments: v.array(v.any()),
  Read: v.optional(v.boolean()),
});
