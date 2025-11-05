import {
  text,
  boolean,
  timestamp,
  uuid,
  doublePrecision,
  integer,
  pgTable,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
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
  name: text().notNull().default(""),
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
  modified_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  cityNameCountryUq: uniqueIndex("cities_name_country_uq").on(t.name, t.country),
}));

// Locations
export const locations = pgTable("locations", {
  id: uuid().defaultRandom().primaryKey(),
  is_draft: boolean().notNull().default(true),
  name: text().notNull(),
  description: text(),
  priceLow: integer(),
  priceHigh: integer(),
  timeLow: integer(),
  timeHigh: integer(),
  type: locationType().notNull(),
  images: text().array(), // array of image URLs
  embedded_links: text().array(), // array of external links
  city: uuid()
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
  street: text(),
  guide: text(),
  is_guide_premium: boolean().default(false),
  longitude: doublePrecision().notNull(),
  latitude: doublePrecision().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  modified_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  cityIdx: index("locations_city_idx").on(t.city),
  typeIdx: index("locations_type_idx").on(t.type),
  latLngIdx: index("locations_lat_lng_idx").on(t.latitude, t.longitude),
}));

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
  modified_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  ownerIdx: index("trips_owner_idx").on(t.owner),
  cityIdx: index("trips_city_idx").on(t.city),
}));

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
    tripIdx: index("locations_trips_trip_idx").on(t.trip),
    locIdx: index("locations_trips_location_idx").on(t.location),
  })
);

// Tags
export const tags = pgTable("tags", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  type: locationType().notNull(),
  icon: text().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  modified_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tagNameTypeUq: uniqueIndex("tags_name_type_uq").on(t.name, t.type),
}));

// Locations Tags
export const locations_tags = pgTable(
  "locations_tags",
  {
    tag: uuid()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    location: uuid()
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ name: "locations_tags_pk", columns: [t.tag, t.location] }),
    tagIdx: index("locations_tags_tag_idx").on(t.tag),
    locIdx: index("locations_tags_location_idx").on(t.location),
  })
);