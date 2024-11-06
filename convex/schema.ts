import { defineSchema } from "convex/server";
import { Conversation } from "./tables/conversation";
import { Email } from "./tables/emails";
import { Message } from "./tables/message";

export default defineSchema({
  emails: Email.table,
  conversation: Conversation.table,
  message: Message.table,
});
