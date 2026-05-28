import { capsule, mutation, query, string, table } from "lakebed/server";
import {
  cleanCompany,
  cleanContactName,
  cleanEmail,
  cleanNotes,
  cleanPhone,
} from "../shared/contacts";

export default capsule({
  name: "simple-crm",

  schema: {
    contacts: table({
      name: string(),
      email: string(),
      phone: string(),
      company: string(),
      notes: string(),
      ownerId: string(),
    }),

    deals: table({
      name: string(),
      stage: string(),
      value: string(),
      contactId: string(),
      ownerId: string(),
    }),

    activities: table({
      type: string(),
      description: string(),
      contactId: string(),
      ownerId: string(),
    }),
  },

  queries: {
    contacts: query((ctx) =>
      ctx.db.contacts
        .where("ownerId", ctx.auth.userId)
        .orderBy("createdAt", "desc")
        .all()
    ),

    deals: query((ctx) =>
      ctx.db.deals
        .where("ownerId", ctx.auth.userId)
        .orderBy("createdAt", "desc")
        .all()
    ),

    activities: query((ctx) =>
      ctx.db.activities
        .where("ownerId", ctx.auth.userId)
        .orderBy("createdAt", "desc")
        .all()
    ),
  },

  mutations: {
    addContact: mutation(
      (ctx, name: string, email: string, phone: string, company: string, notes: string) => {
        const cleanName = cleanContactName(name);
        if (!cleanName) {
          return;
        }

        ctx.db.contacts.insert({
          name: cleanName,
          email: cleanEmail(email),
          phone: cleanPhone(phone),
          company: cleanCompany(company),
          notes: cleanNotes(notes),
          ownerId: ctx.auth.userId,
        });
      }
    ),

    updateContact: mutation(
      (ctx, id: string, name: string, email: string, phone: string, company: string, notes: string) => {
        const contact = ctx.db.contacts.get(id);
        if (!contact || contact.ownerId !== ctx.auth.userId) {
          return;
        }

        const cleanName = cleanContactName(name);
        if (!cleanName) {
          return;
        }

        ctx.db.contacts.update(id, {
          name: cleanName,
          email: cleanEmail(email),
          phone: cleanPhone(phone),
          company: cleanCompany(company),
          notes: cleanNotes(notes),
        });
      }
    ),

    deleteContact: mutation((ctx, id: string) => {
      const contact = ctx.db.contacts.get(id);
      if (!contact || contact.ownerId !== ctx.auth.userId) {
        return;
      }
      ctx.db.contacts.delete(id);
    }),

    addDeal: mutation(
      (ctx, name: string, stage: string, value: string, contactId: string) => {
        const contact = ctx.db.contacts.get(contactId);
        if (!contact || contact.ownerId !== ctx.auth.userId) {
          return;
        }

        const cleanName = name.trim().slice(0, 200);
        if (!cleanName) {
          return;
        }

        ctx.db.deals.insert({
          name: cleanName,
          stage,
          value: value.trim().slice(0, 50),
          contactId,
          ownerId: ctx.auth.userId,
        });
      }
    ),

    updateDealStage: mutation((ctx, id: string, stage: string) => {
      const deal = ctx.db.deals.get(id);
      if (!deal || deal.ownerId !== ctx.auth.userId) {
        return;
      }
      ctx.db.deals.update(id, { stage });
    }),

    deleteDeal: mutation((ctx, id: string) => {
      const deal = ctx.db.deals.get(id);
      if (!deal || deal.ownerId !== ctx.auth.userId) {
        return;
      }
      ctx.db.deals.delete(id);
    }),

    addActivity: mutation(
      (ctx, type: string, description: string, contactId: string) => {
        const contact = ctx.db.contacts.get(contactId);
        if (!contact || contact.ownerId !== ctx.auth.userId) {
          return;
        }

        const cleanDesc = description.trim().slice(0, 2000);
        if (!cleanDesc) {
          return;
        }

        ctx.db.activities.insert({
          type,
          description: cleanDesc,
          contactId,
          ownerId: ctx.auth.userId,
        });
      }
    ),

    deleteActivity: mutation((ctx, id: string) => {
      const activity = ctx.db.activities.get(id);
      if (!activity || activity.ownerId !== ctx.auth.userId) {
        return;
      }
      ctx.db.activities.delete(id);
    }),
  },
});
