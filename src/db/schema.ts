import {
  text,
  boolean,
  timestamp,
  uuid,
  doublePrecision,
  integer,
  pgTable,
  pgEnum,
  primaryKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { PLAN_TYPES, BILLING_TYPES, LOCATION_TYPES, ROLE_TYPES } from "@/constants/enums";

// Enums
export const planType = pgEnum("plan_types", PLAN_TYPES);
export const billingType = pgEnum("billing_types", BILLING_TYPES);
export const locationType = pgEnum("location_types", LOCATION_TYPES);
export const roleType = pgEnum("role_types", ROLE_TYPES);

// Profiles
export const profiles = pgTable("profiles", {
  id: uuid().primaryKey().defaultRandom().notNull(),
  clerk_id: text().notNull().unique(), // maps to Kinde user ID
  role: roleType().notNull().default("user"),
  plan: planType().notNull().default("free"),
  billing_type: billingType(),
  next_billing_at: timestamp({ withTimezone: true }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

// Cities
export const cities = pgTable("cities", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  country: text().notNull(),
  is_draft: boolean().notNull().default(true),
  center_latitude: doublePrecision().notNull(),
  center_longitude: doublePrecision().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  modified_at: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`NOW()`),
});

// Locations
export const locations = pgTable("locations", {
  id: uuid().defaultRandom().primaryKey(),
  is_draft: boolean().notNull().default(true),
  name: text().notNull(),
  description: text(),
  type: locationType().notNull(),
  images: text().array(), // array of image URLs
  embedded_links: text().array(), // array of external links
  tags: text().array(),
  city: uuid()
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
  street: text(),
  guide: text(),
  is_guide_premium: boolean().default(false),
  longitude: doublePrecision().notNull(),
  latitude: doublePrecision().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  modified_at: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`NOW()`),
});

// Trips
export const trips = pgTable("trips", {
  id: uuid().defaultRandom().primaryKey(),
  owner: uuid()
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),

  name: text().notNull(),
  city: uuid().notNull().references(() => cities.id, { onDelete: "cascade" }),

  // Optional trip data (for premium users)
  number_of_adults: integer(),
  number_of_children: integer(),
  preferences: text().array(), // Array of string tags

  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  modified_at: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => sql`NOW()`),
});

// Locations Trips
export const locations_trips = pgTable(
  "locations_trips",
  {
    trip: uuid()
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    location: uuid()
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ name: "locations_trips_pk", columns: [t.trip, t.location] }),
  })
);