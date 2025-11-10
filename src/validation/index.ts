// zod-schemas.ts
import { z } from "zod";
import { PLAN_TYPES, BILLING_TYPES, LOCATION_TYPES, ROLE_TYPES } from "@/constants/enums";

/* -------------------------------- Helpers -------------------------------- */

const uuid = z.string().uuid();
const nonEmpty = z.string().trim().min(1);

// For update payloads: ensure at least one key is present
const atLeastOne =
  <T extends z.ZodRawShape>(shape: T) =>
    z.object(shape).partial().refine(
      (obj) => Object.keys(obj).some((k) => obj[k as keyof typeof obj] !== undefined),
      { message: "Provide at least one field to update." }
    );

// Latitude/longitude ranges
const latitude = z.number().gte(-90).lte(90);
const longitude = z.number().gte(-180).lte(180);

// Arrays
const stringArray = z.array(z.string());
const urlArray = z.array(z.string().url());
// File paths or URLs (for images stored in Supabase)
const filePathArray = z.array(z.string().min(1));

// Enums (wired to your constants)
export const RoleEnum = z.enum(ROLE_TYPES as [string, ...string[]]);
export const PlanEnum = z.enum(PLAN_TYPES as [string, ...string[]]);
export const BillingEnum = z.enum(BILLING_TYPES as [string, ...string[]]).nullable().optional();
export const LocationTypeEnum = z.enum(LOCATION_TYPES as [string, ...string[]]);

/* ------------------------------- PROFILES --------------------------------- */

// CREATE: id/created_at are DB-managed
export const ProfileCreate = z.object({
  clerk_id: nonEmpty,               // from Clerk
  role: RoleEnum.optional(),        // default in DB: "user"
  plan: PlanEnum.optional(),        // default in DB: "free"
  billing_type: z.enum(BILLING_TYPES as [string, ...string[]]).optional(),
  next_billing_at: z.coerce.date().optional(),
});

// UPDATE: usually you won’t let clients change clerk_id
export const ProfileUpdate = atLeastOne({
  role: RoleEnum.optional(),
  plan: PlanEnum.optional(),
  billing_type: z.enum(BILLING_TYPES as [string, ...string[]]).nullable().optional(),
  next_billing_at: z.coerce.date().nullable().optional(),
});
export type ProfileCreateInput = z.infer<typeof ProfileCreate>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdate>;

/* -------------------------------- CITIES ---------------------------------- */

// CREATE
export const CityCreate = z.object({
  name: nonEmpty,
  country: nonEmpty,
  is_draft: z.boolean().optional(), // default true in DB
  center_latitude: latitude,
  center_longitude: longitude,
});

// UPDATE
export const CityUpdate = atLeastOne({
  name: nonEmpty.optional(),
  country: nonEmpty.optional(),
  is_draft: z.boolean().optional(),
  center_latitude: latitude.optional(),
  center_longitude: longitude.optional(),
});
export type CityCreateInput = z.infer<typeof CityCreate>;
export type CityUpdateInput = z.infer<typeof CityUpdate>;

/* ------------------------------- LOCATIONS -------------------------------- */

// CREATE
export const LocationCreate = z.object({
  is_draft: z.boolean().optional(), // default true
  name: nonEmpty,
  description: z.string().optional(),
  priceLow: z.number().int().nullable().optional(),
  priceHigh: z.number().int().nullable().optional(),
  timeLow: z.number().int().nullable().optional(),
  timeHigh: z.number().int().nullable().optional(),
  type: LocationTypeEnum,
  images: filePathArray.default([]).optional(),          // File paths in Supabase Storage
  embedded_links: urlArray.default([]).optional(),
  city: uuid,
  street: z.string().optional(),
  guide: z.record(z.string(), z.unknown()).nullable().optional(), // EditorJS JSONB data
  is_guide_premium: z.boolean().optional(),
  longitude: longitude,
  latitude: latitude,
});

// UPDATE
export const LocationUpdate = atLeastOne({
  is_draft: z.boolean().optional(),
  name: nonEmpty.optional(),
  description: z.string().optional(),
  priceLow: z.number().int().nullable().optional(),
  priceHigh: z.number().int().nullable().optional(),
  timeLow: z.number().int().nullable().optional(),
  timeHigh: z.number().int().nullable().optional(),
  type: LocationTypeEnum.optional(),
  images: filePathArray.optional(),          // File paths in Supabase Storage
  embedded_links: urlArray.optional(),
  city: uuid.optional(),
  street: z.string().optional(),
  guide: z.record(z.string(), z.unknown()).nullable().optional(), // EditorJS JSONB data
  is_guide_premium: z.boolean().optional(),
  longitude: longitude.optional(),
  latitude: latitude.optional(),
});
export type LocationCreateInput = z.infer<typeof LocationCreate>;
export type LocationUpdateInput = z.infer<typeof LocationUpdate>;

/* --------------------------------- TAGS ----------------------------------- */

// CREATE
export const TagCreate = z.object({
  name: nonEmpty,
  icon: nonEmpty,
  type: LocationTypeEnum,
});

// UPDATE
export const TagUpdate = atLeastOne({
  name: nonEmpty.optional(),
  icon: nonEmpty.optional(),
  type: LocationTypeEnum.optional(),
});
export type TagCreateInput = z.infer<typeof TagCreate>;
export type TagUpdateInput = z.infer<typeof TagUpdate>;

/* --------------------------------- TRIPS ---------------------------------- */

// CREATE
export const TripCreate = z.object({
  owner: uuid,
  name: nonEmpty,
  city: uuid,
  number_of_adults: z.number().int().min(0).optional(),
  number_of_children: z.number().int().min(0).optional(),
  preferences: stringArray.default([]).optional(),
});

// UPDATE
export const TripUpdate = atLeastOne({
  owner: uuid.optional(),
  name: nonEmpty.optional(),
  city: uuid.optional(),
  number_of_adults: z.number().int().min(0).nullable().optional(),
  number_of_children: z.number().int().min(0).nullable().optional(),
  preferences: stringArray.optional(),
});
export type TripCreateInput = z.infer<typeof TripCreate>;
export type TripUpdateInput = z.infer<typeof TripUpdate>;

/* -------------------------- JOIN TABLES (M2M) ----------------------------- */
/**
 * For M2M tables you typically INSERT or DELETE rows (immutable pairs).
 * Updates don’t make much sense because the PK is the pair itself.
 */

// locations_trips
export const LocationTripLinkCreate = z.object({
  trip: uuid,
  location: uuid,
});
export type LocationTripLinkCreateInput = z.infer<typeof LocationTripLinkCreate>;

// locations_tags
export const LocationTagLinkCreate = z.object({
  tag: uuid,
  location: uuid,
});
export type LocationTagLinkCreateInput = z.infer<typeof LocationTagLinkCreate>;

/* ------------------------------ Request shapes ---------------------------- */
/**
 * Optional: route-friendly wrappers if you pass IDs in path params.
 * e.g., Update with path id + body.
 */
export const WithPathId = z.object({ id: uuid });
export type WithPathId = z.infer<typeof WithPathId>;