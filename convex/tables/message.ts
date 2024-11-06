import { Table } from "convex-helpers/server";
import { v } from "convex/values";

export const Message = Table("mesages", {
  text: v.string(),
  email: v.id("emails"),
  conversation: v.id("conversations"),
});
