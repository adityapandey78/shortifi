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
  // New features
  expiresAt: timestamp("expires_at"),
  password: varchar('password', { length: 255 }),
  clickCount: integer("click_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Analytics table (tracks each click on a short link)
export const analytics = pgTable('analytics', {
  id: serial('id').primaryKey(),
  linkId: integer("link_id").notNull().references(() => short_links.id, { onDelete: "cascade" }),
  
  // Request information
  ip: varchar('ip', { length: 45 }), // IPv6 can be up to 45 chars
  userAgent: text("user_agent"),
  referer: varchar('referer', { length: 1024 }),
  
  // Device information
  deviceType: varchar('device_type', { length: 50 }), // mobile, tablet, desktop
  deviceVendor: varchar('device_vendor', { length: 100 }),
  deviceModel: varchar('device_model', { length: 100 }),
  
  // Browser information
  browser: varchar('browser', { length: 50 }),
  browserVersion: varchar('browser_version', { length: 50 }),
  
  // OS information
  os: varchar('os', { length: 50 }),
  osVersion: varchar('os_version', { length: 50 }),
  
  // Location information
  country: varchar('country', { length: 100 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  timezone: varchar('timezone', { length: 100 }),
  
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
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
export const shortLinksrelations = relations(short_links,({one, many})=>({
  user: one(usersTable,{
    fields:[short_links.userId],
    references:[usersTable.id],
  }),
  analytics: many(analytics)
}))

// Relation: analytics belongs to one short link
export const analyticsRelation = relations(analytics, ({ one }) => ({
  link: one(short_links, {
    fields: [analytics.linkId],
    references: [short_links.id],
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
