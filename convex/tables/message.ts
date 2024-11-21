import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Message = Table("messages", {
  shortenEmail: v.string(),
  choices: v.array(
    v.object({ shortResponse: v.string(), longResponse: v.string() })
  ),
  email: v.id("emails"),
  conversation: v.id("conversations"),
});
