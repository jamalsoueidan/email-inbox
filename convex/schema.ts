import { defineSchema } from "convex/server";
import { Collection } from "./tables/collections";
import { Conversation } from "./tables/conversation";
import { Email } from "./tables/emails";
import { Message } from "./tables/message";

export default defineSchema({
  emails: Email.table
    .index("byFrom", ["from"])
    .searchIndex("search_from", { searchField: "from" }),
  conversations: Conversation.table.index("byFrom", ["from"]),
  messages: Message.table.index("byConversation", ["conversation"]),
  collections: Collection.table.index("byEmails", ["emails"]),
});
