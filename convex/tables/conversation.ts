import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Conversation = Table("conversations", {
  from: v.string(),
  fromName: v.string(),
  lastDate: v.number(),
  threadId: v.string(),
});
