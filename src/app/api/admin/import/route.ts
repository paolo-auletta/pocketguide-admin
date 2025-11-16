import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { cities, locations, trips, tags, locations_trips, locations_tags } from '@/db/schema';
import {
  CityCreate,
  CityCreateInput,
  LocationCreate,
  LocationCreateInput,
  TripCreate,
  TripCreateInput,
  TagCreate,
  TagCreateInput,
  LocationTripLinkCreate,
  LocationTripLinkCreateInput,
  LocationTagLinkCreate,
  LocationTagLinkCreateInput,
} from '@/validation';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

interface CsvRow {
  [key: string]: string;
}

interface ImportRowError {
  row: number; // 1-based index in the CSV (including header)
  message: string;
  details?: unknown;
}

interface ImportResult {
  inserted: number;
  errors: ImportRowError[];
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

function toCsvObjects(csvText: string): CsvRow[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => h.trim()).filter(Boolean);

  const objects: CsvRow[] = [];

  for (const row of dataRows) {
    // Skip completely empty rows
    if (!row.some((cell) => cell && cell.trim() !== '')) continue;

    const obj: CsvRow = {};
    headers.forEach((header, index) => {
      obj[header] = (row[index] ?? '').trim();
    });
    objects.push(obj);
  }

  return objects;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const lower = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(lower)) return true;
  if (['false', '0', 'no', 'n'].includes(lower)) return false;
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) return undefined;
  return num;
}

function parseStringArray(value: string | undefined): string[] | undefined {
  if (!value || !value.trim()) return undefined;

  const trimmed = value.trim();

  // JSON array
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v));
      }
    } catch {
      // fall through
    }
  }

  // Fallback: split by pipe or comma
  if (trimmed.includes('|')) {
    return trimmed.split('|').map((v) => v.trim()).filter(Boolean);
  }

  if (trimmed.includes(',')) {
    return trimmed.split(',').map((v) => v.trim()).filter(Boolean);
  }

  return [trimmed];
}

async function importCities(rows: CsvRow[]): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // header is row 1

    const input: Partial<CityCreateInput> = {};
    if (row.name) input.name = row.name;
    if (row.country) input.country = row.country;
    const isDraft = parseBoolean(row.is_draft);
    if (isDraft !== undefined) input.is_draft = isDraft;
    const lat = parseNumber(row.center_latitude);
    if (lat !== undefined) input.center_latitude = lat;
    const lng = parseNumber(row.center_longitude);
    if (lng !== undefined) input.center_longitude = lng;

    const validation = CityCreate.safeParse(input);
    if (!validation.success) {
      errors.push({ row: rowNumber, message: 'Validation failed', details: validation.error.issues });
      continue;
    }

    const data = validation.data;

    try {
      const result = await db
        .insert(cities)
        .values({
          name: data.name,
          country: data.country,
          is_draft: data.is_draft ?? true,
          center_latitude: data.center_latitude,
          center_longitude: data.center_longitude,
        })
        .returning();

      if (!result[0]) {
        errors.push({ row: rowNumber, message: 'Failed to insert city' });
        continue;
      }

      inserted += 1;
    } catch (error) {
      errors.push({ row: rowNumber, message: 'Database error inserting city', details: error });
    }
  }

  return { inserted, errors };
}

async function importLocations(rows: CsvRow[]): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const input: Partial<LocationCreateInput> = {};
    const isDraft = parseBoolean(row.is_draft);
    if (isDraft !== undefined) input.is_draft = isDraft;
    if (row.name) input.name = row.name;
    if (row.description) input.description = row.description;
    const priceLow = parseNumber(row.priceLow);
    if (priceLow !== undefined) input.priceLow = priceLow;
    const priceHigh = parseNumber(row.priceHigh);
    if (priceHigh !== undefined) input.priceHigh = priceHigh;
    const timeLow = parseNumber(row.timeLow);
    if (timeLow !== undefined) input.timeLow = timeLow;
    const timeHigh = parseNumber(row.timeHigh);
    if (timeHigh !== undefined) input.timeHigh = timeHigh;
    if (row.type) input.type = row.type as LocationCreateInput['type'];
    const images = parseStringArray(row.images);
    if (images !== undefined) input.images = images;
    const embeddedLinks = parseStringArray(row.embedded_links);
    if (embeddedLinks !== undefined) input.embedded_links = embeddedLinks;
    if (row.city) input.city = row.city;
    if (row.street) input.street = row.street;
    if (row.guide) {
      try {
        input.guide = JSON.parse(row.guide);
      } catch (error) {
        errors.push({ row: rowNumber, message: 'Invalid JSON in guide field', details: error });
        continue;
      }
    }
    const isGuidePremium = parseBoolean(row.is_guide_premium);
    if (isGuidePremium !== undefined) input.is_guide_premium = isGuidePremium;
    const lng = parseNumber(row.longitude);
    if (lng !== undefined) input.longitude = lng;
    const lat = parseNumber(row.latitude);
    if (lat !== undefined) input.latitude = lat;

    const validation = LocationCreate.safeParse(input);
    if (!validation.success) {
      errors.push({ row: rowNumber, message: 'Validation failed', details: validation.error.issues });
      continue;
    }

    const data = validation.data;

    const guideValue =
      typeof data.guide === 'string'
        ? data.guide
        : data.guide
        ? JSON.stringify(data.guide)
        : null;

    try {
      const result = await db
        .insert(locations)
        .values({
          name: data.name,
          is_draft: data.is_draft ?? true,
          description: data.description || null,
          priceLow: data.priceLow ?? null,
          priceHigh: data.priceHigh ?? null,
          timeLow: data.timeLow ?? null,
          timeHigh: data.timeHigh ?? null,
          type: data.type,
          images: data.images && data.images.length > 0 ? data.images : null,
          embedded_links: data.embedded_links && data.embedded_links.length > 0 ? data.embedded_links : null,
          city: data.city,
          street: data.street || null,
          guide: guideValue,
          is_guide_premium: data.is_guide_premium ?? false,
          longitude: data.longitude,
          latitude: data.latitude,
        })
        .returning();

      if (!result[0]) {
        errors.push({ row: rowNumber, message: 'Failed to insert location' });
        continue;
      }

      inserted += 1;
    } catch (error) {
      errors.push({ row: rowNumber, message: 'Database error inserting location', details: error });
    }
  }

  return { inserted, errors };
}

async function importTrips(rows: CsvRow[]): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const input: Partial<TripCreateInput> = {};
    if (row.owner) input.owner = row.owner;
    if (row.name) input.name = row.name;
    if (row.city) input.city = row.city;
    const adults = parseNumber(row.number_of_adults);
    if (adults !== undefined) input.number_of_adults = adults;
    const children = parseNumber(row.number_of_children);
    if (children !== undefined) input.number_of_children = children;
    const prefs = parseStringArray(row.preferences);
    if (prefs !== undefined) input.preferences = prefs;

    const validation = TripCreate.safeParse(input);
    if (!validation.success) {
      errors.push({ row: rowNumber, message: 'Validation failed', details: validation.error.issues });
      continue;
    }

    const data = validation.data;

    try {
      const result = await db
        .insert(trips)
        .values({
          name: data.name,
          owner: data.owner,
          city: data.city,
          number_of_adults: data.number_of_adults ?? null,
          number_of_children: data.number_of_children ?? null,
          preferences: data.preferences && data.preferences.length > 0 ? data.preferences : null,
        })
        .returning();

      if (!result[0]) {
        errors.push({ row: rowNumber, message: 'Failed to insert trip' });
        continue;
      }

      inserted += 1;
    } catch (error) {
      errors.push({ row: rowNumber, message: 'Database error inserting trip', details: error });
    }
  }

  return { inserted, errors };
}

async function importTags(rows: CsvRow[]): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const input: Partial<TagCreateInput> = {};
    if (row.name) input.name = row.name;
    if (row.icon) input.icon = row.icon;
    if (row.type) input.type = row.type as TagCreateInput['type'];

    const validation = TagCreate.safeParse(input);
    if (!validation.success) {
      errors.push({ row: rowNumber, message: 'Validation failed', details: validation.error.issues });
      continue;
    }

    const data = validation.data;

    try {
      const result = await db
        .insert(tags)
        .values({
          name: data.name,
          icon: data.icon,
          type: data.type,
        })
        .returning();

      if (!result[0]) {
        errors.push({ row: rowNumber, message: 'Failed to insert tag' });
        continue;
      }

      inserted += 1;
    } catch (error) {
      errors.push({ row: rowNumber, message: 'Database error inserting tag', details: error });
    }
  }

  return { inserted, errors };
}

async function importLocationTrips(rows: CsvRow[]): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const input: Partial<LocationTripLinkCreateInput> = {};
    if (row.trip) input.trip = row.trip;
    if (row.location) input.location = row.location;

    const validation = LocationTripLinkCreate.safeParse(input);
    if (!validation.success) {
      errors.push({ row: rowNumber, message: 'Validation failed', details: validation.error.issues });
      continue;
    }

    const data = validation.data;

    try {
      const result = await db
        .insert(locations_trips)
        .values({
          trip: data.trip,
          location: data.location,
        })
        .returning();

      if (!result[0]) {
        errors.push({ row: rowNumber, message: 'Failed to insert location_trip link' });
        continue;
      }

      inserted += 1;
    } catch (error: unknown) {
      const dbError = error as { code?: string; cause?: { code?: string } };
      const code = dbError.code ?? dbError.cause?.code;
      if (code === '23505') {
        errors.push({ row: rowNumber, message: 'Duplicate trip-location pair', details: error });
      } else {
        errors.push({ row: rowNumber, message: 'Database error inserting location_trip link', details: error });
      }
    }
  }

  return { inserted, errors };
}

async function importLocationTags(rows: CsvRow[]): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;

    const input: Partial<LocationTagLinkCreateInput> = {};
    if (row.tag) input.tag = row.tag;
    if (row.location) input.location = row.location;

    const validation = LocationTagLinkCreate.safeParse(input);
    if (!validation.success) {
      errors.push({ row: rowNumber, message: 'Validation failed', details: validation.error.issues });
      continue;
    }

    const data = validation.data;

    try {
      const result = await db
        .insert(locations_tags)
        .values({
          tag: data.tag,
          location: data.location,
        })
        .returning();

      if (!result[0]) {
        errors.push({ row: rowNumber, message: 'Failed to insert location_tag link' });
        continue;
      }

      inserted += 1;
    } catch (error: unknown) {
      const dbError = error as { code?: string; cause?: { code?: string } };
      const code = dbError.code ?? dbError.cause?.code;
      if (code === '23505') {
        errors.push({ row: rowNumber, message: 'Duplicate tag-location pair', details: error });
      } else {
        errors.push({ row: rowNumber, message: 'Database error inserting location_tag link', details: error });
      }
    }
  }

  return { inserted, errors };
}

async function runImport(table: string, rows: CsvRow[]): Promise<ImportResult> {
  switch (table) {
    case 'cities':
      return importCities(rows);
    case 'locations':
      return importLocations(rows);
    case 'trips':
      return importTrips(rows);
    case 'tags':
      return importTags(rows);
    case 'locations_trips':
      return importLocationTrips(rows);
    case 'locations_tags':
      return importLocationTags(rows);
    default:
      throw new Error(`Unsupported table for import: ${table}`);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();
    const table = body.table as string | undefined;
    const csv = body.csv as string | undefined;

    if (!table || !csv) {
      return NextResponse.json(
        { error: 'Missing table or csv in request body' },
        { status: 400 }
      );
    }

    const rows = toCsvObjects(csv);
    if (!rows.length) {
      return NextResponse.json(
        { error: 'CSV appears to be empty or has no data rows' },
        { status: 400 }
      );
    }

    try {
      const result = await runImport(table, rows);
      return NextResponse.json({ data: result });
    } catch (error) {
      console.error('Error running import:', error);
      return NextResponse.json(
        { error: (error as Error)?.message ?? 'Failed to import CSV' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in CSV import:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV import', details: error },
      { status: 500 }
    );
  }
}
