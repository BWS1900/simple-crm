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
  },

  queries: {
    contacts: query((ctx) =>
      ctx.db.contacts
        .where("ownerId", ctx.auth.userId)
        .orderBy("createdAt", "desc")
        .all()
    ),
  },

  mutations: {
    addContact: mutation(
      (
        ctx,
        name: string,
        email: string,
        phone: string,
        company: string,
        notes: string
      ) => {
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
      (
        ctx,
        id: string,
        name: string,
        email: string,
        phone: string,
        company: string,
        notes: string
      ) => {
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
  },
});
