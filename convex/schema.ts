import { defineSchema } from "convex/server";
import { Conversation } from "./tables/conversation";
import { Email } from "./tables/emails";
import { Message } from "./tables/message";

export default defineSchema({
  emails: Email.table.index("byFrom", ["From"]),
  conversations: Conversation.table.index("byFrom", ["from"]),
  messages: Message.table.index("byConversation", ["conversation"]),
});
