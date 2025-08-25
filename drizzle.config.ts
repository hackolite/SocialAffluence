import { defineConfig } from "drizzle-kit";

// Only require DATABASE_URL for database operations
// This prevents the app from crashing when using memory storage
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Database operations will not be available. Using memory storage.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
