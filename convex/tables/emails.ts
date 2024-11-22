import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Email = Table("emails", {
  date: v.number(),

  //custom fields:
  shortenMsgRun: v.optional(v.boolean()),
  shortenMsgRunAt: v.optional(v.number()), // if we have
  markedAsRead: v.optional(v.boolean()),
  textBodyRun: v.optional(v.boolean()),
  textBodyRunAt: v.optional(v.number()),
  nickname: v.string(), // email nickname@
  domain: v.string(), // email @domain.com
  fromName: v.string(), // email full name
  from: v.string(), // email nickname@domain.com
  toFull: v.array(
    v.object({
      name: v.string(),
      email: v.string(),
      mailboxHash: v.string(),
    })
  ),
  htmlBody: v.string(),
  subject: v.string(),
  textBody: v.string(),
  attachments: v.array(v.any()),
});
