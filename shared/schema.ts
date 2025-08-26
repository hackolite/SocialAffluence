import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
});

export const logins = pgTable("logins", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull(),
  name: text("name"),
  email: text("email"),
  loginTime: timestamp("login_time").defaultNow().notNull(),
  ip: text("ip"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  googleId: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
});

export const insertLoginSchema = createInsertSchema(logins).pick({
  googleId: true,
  name: true,
  email: true,
  loginTime: true,
  ip: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLogin = z.infer<typeof insertLoginSchema>;
export type Login = typeof logins.$inferSelect;
