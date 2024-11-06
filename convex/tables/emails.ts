import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Email = Table("emails", {
  Date: v.optional(v.string()),
  From: v.optional(v.string()),
  FromName: v.optional(v.string()),
  HtmlBody: v.optional(v.string()),
  Subject: v.optional(v.string()),
  TextBody: v.optional(v.string()),
  Attachments: v.optional(v.array(v.any())),
});
