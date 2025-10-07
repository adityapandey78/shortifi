import { relations, sql } from 'drizzle-orm';
import { boolean, pgTable, serial, timestamp, varchar, integer, text, pgEnum } from 'drizzle-orm/pg-core';

// Drizzle schema: users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isEmailValid: boolean("is_email_valid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Verify email tokens table (stores tokens for email verification)
export const verifyEmailTokensTable = pgTable("is_email_valid", {
  id: serial('id').primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar('token', { length: 8 }).notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`CURRENT_TIMESTAMP + INTERVAL '1 day'`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Short links table (each short link belongs to a user)
export const short_links = pgTable('short_links', {
  id: serial('id').primaryKey(),
  shortCode: varchar('shortCode', { length: 16 }).notNull().unique(),
  url: varchar('url', { length: 2048 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").notNull().references(()=>usersTable.id),
});

/*
  Column naming strategy:
  - Use snake_case for actual DB column names (e.g., created_at).
  - Use camelCase in JS for working with values (e.g., createdAt).
*/

// Relations: a user can have many short links and many sessions
export const usersRelation = relations(usersTable,({many})=>({
  shortLinks:many(short_links),
  sessions:many(sessionsTable)
}))

// Relation: a short link belongs to one user
export const shortLinksrelations = relations(short_links,({one})=>({
  user: one(usersTable,{
    fields:[short_links.userId],
    references:[usersTable.id],
  })
}))

// Define enum for providers
export const providerEnum = pgEnum('provider', ['google', 'github']);

// OAuth accounts table (links providers to users)
export const oauthAccountsTable = pgTable("oauth_accounts",{
  id: serial("id").primaryKey(),
  userId: integer("user_id")
          .notNull()
          .references(()=>usersTable.id,{onDelete:"cascade"}),
  provider: providerEnum("provider").notNull(),
  providerAccountId: varchar("provider_account_id",{length:255})
        .notNull()
        .unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table (server-side session storage)
export const sessionsTable = pgTable("sessions",{
  id: serial('id').primaryKey(),
  userId: integer("user_id").notNull()
                       .references(()=> usersTable.id,{onDelete: 'cascade'}),
  valid: boolean('valid').default(true).notNull(),
  userAgent: text("user_agent"),
  ip: varchar('ip', {length:255}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Relation: a session belongs to one user
export const sessionRelation = relations(sessionsTable,({one})=>({
  user:one(usersTable,{
    fields:[sessionsTable.userId],
    references:[usersTable.id],
  })
}))

// Note on relations:
// - If the current table owns the foreign key, specify fields (local FK columns) and references (target PK columns).
// - If the foreign key is in the other table, Drizzle can infer the relationship automatically.
