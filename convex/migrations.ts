import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";

export const migrations = new Migrations<DataModel>(components.migrations);

export const createCollections = migrations.define({
  table: "emails",
  batchSize: 10,
  migrateOne: (ctx, doc) => {
    ctx.runMutation(internal.collection.create, {
      name: doc.fromName,
      emails: [doc.from],
      lastUpdated: doc._creationTime,
    });
  },
});

export const divideEmailsIntoNickname = migrations.define({
  table: "emails",
  batchSize: 30,
  migrateOne: async (ctx, doc) => {
    if (doc.nickname === undefined) {
      const [nickname, domain] = doc.from.split("@");
      return { nickname, domain };
    }
  },
});

export const run = migrations.runner();
