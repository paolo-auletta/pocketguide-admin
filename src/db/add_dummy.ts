// seed-italy.ts
import { sql } from "drizzle-orm";
import { cities, locations } from "@/db/schema"; // <- update path if different
import { LOCATION_TYPES } from "@/constants/enums";

// If you want stronger typing for your db, replace `any` with your Drizzle DB type
export async function seedItaly(db: any) {
  // --- Cities (Italy only) ---
  const italianCities = [
    { name: "Rome",     country: "Italy", center_latitude: 41.9028, center_longitude: 12.4964 },
    { name: "Milan",    country: "Italy", center_latitude: 45.4642, center_longitude: 9.1900  },
    { name: "Naples",   country: "Italy", center_latitude: 40.8518, center_longitude: 14.2681 },
    { name: "Turin",    country: "Italy", center_latitude: 45.0703, center_longitude: 7.6869  },
    { name: "Florence", country: "Italy", center_latitude: 43.7696, center_longitude: 11.2558 },
    { name: "Venice",   country: "Italy", center_latitude: 45.4408, center_longitude: 12.3155 },
    { name: "Bologna",  country: "Italy", center_latitude: 44.4949, center_longitude: 11.3426 },
    { name: "Palermo",  country: "Italy", center_latitude: 38.1157, center_longitude: 13.3615 },
    { name: "Bari",     country: "Italy", center_latitude: 41.1171, center_longitude: 16.8719 },
    { name: "Genoa",    country: "Italy", center_latitude: 44.4056, center_longitude: 8.9463  },
  ].map(c => ({
    ...c,
    is_draft: false,
    created_at: sql`NOW()` as unknown as Date,
    modified_at: sql`NOW()` as unknown as Date,
  }));

  const insertedCities = await db
    .insert(cities)
    .values(italianCities)
    .onConflictDoNothing() // safe re-runs (PK is random UUID; if you add a unique name later, this will help)
    .returning({ id: cities.id, name: cities.name });

  // Build a quick lookup: city name -> city id
  const cityIdByName = new Map(insertedCities.map((c: any) => [c.name, c.id]));

  // Helper to pick a valid location type from your enum array
  const pickType = (i: number) =>
    LOCATION_TYPES[i % Math.max(1, LOCATION_TYPES.length)] as (typeof LOCATION_TYPES)[number];

  // --- Dummy Locations (a couple per city) ---
  type RawLoc = {
    cityName: string;
    latitude: number;
    longitude: number;
    street?: string;
    guide?: string;
    images?: string[];
    embedded_links?: string[];
    is_guide_premium?: boolean;
  };

  const rawLocations: RawLoc[] = [
    // Rome
    {
      cityName: "Rome",
      latitude: 41.8902,
      longitude: 12.4922,
      guide: "Colosseum — iconic ancient amphitheatre.",
      images: ["https://picsum.photos/seed/colosseum/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Colosseum"],
      is_guide_premium: true,
    },
    {
      cityName: "Rome",
      latitude: 41.9009,
      longitude: 12.4833,
      guide: "Trevi Fountain — Baroque fountain famous for coin tossing.",
      images: ["https://picsum.photos/seed/trevi/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Trevi_Fountain"],
    },

    // Milan
    {
      cityName: "Milan",
      latitude: 45.4642,
      longitude: 9.1916,
      guide: "Duomo di Milano — cathedral with stunning rooftop views.",
      images: ["https://picsum.photos/seed/milan-duomo/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Milan_Cathedral"],
      is_guide_premium: true,
    },
    {
      cityName: "Milan",
      latitude: 45.4506,
      longitude: 9.1700,
      guide: "Navigli — lively canals, cafés, and aperitivo spots.",
      images: ["https://picsum.photos/seed/navigli/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Navigli"],
    },

    // Naples
    {
      cityName: "Naples",
      latitude: 40.8270,
      longitude: 14.2470,
      guide: "Castel dell'Ovo — seaside castle on the Gulf of Naples.",
      images: ["https://picsum.photos/seed/castel-ovo/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Castel_dell%27Ovo"],
    },
    {
      cityName: "Naples",
      latitude: 40.8511,
      longitude: 14.2597,
      guide: "Napoli Sotterranea — underground tunnels and caverns.",
      images: ["https://picsum.photos/seed/napoli-underground/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Naples_Underground_Geothermal_Zone"],
      is_guide_premium: true,
    },

    // Turin
    {
      cityName: "Turin",
      latitude: 45.0689,
      longitude: 7.6931,
      guide: "Mole Antonelliana — landmark tower with cinema museum.",
      images: ["https://picsum.photos/seed/mole/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Mole_Antonelliana"],
    },
    {
      cityName: "Turin",
      latitude: 45.0677,
      longitude: 7.6827,
      guide: "Egyptian Museum — world-class collection of Egyptian antiquities.",
      images: ["https://picsum.photos/seed/egyptian-museum/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Egyptian_Museum_(Turin)"],
      is_guide_premium: true,
    },

    // Florence
    {
      cityName: "Florence",
      latitude: 43.7687,
      longitude: 11.2550,
      guide: "Uffizi Gallery — Renaissance masterworks in a historic palace.",
      images: ["https://picsum.photos/seed/uffizi/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Uffizi"],
    },
    {
      cityName: "Florence",
      latitude: 43.7679,
      longitude: 11.2531,
      guide: "Ponte Vecchio — medieval bridge lined with shops.",
      images: ["https://picsum.photos/seed/ponte-vecchio/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Ponte_Vecchio"],
      is_guide_premium: true,
    },

    // Venice
    {
      cityName: "Venice",
      latitude: 45.4342,
      longitude: 12.3389,
      guide: "Piazza San Marco — Venice’s grand central square.",
      images: ["https://picsum.photos/seed/sanmarco/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Piazza_San_Marco"],
    },
    {
      cityName: "Venice",
      latitude: 45.4380,
      longitude: 12.3358,
      guide: "Rialto Bridge — historic bridge over the Grand Canal.",
      images: ["https://picsum.photos/seed/rialto/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Rialto_Bridge"],
      is_guide_premium: true,
    },

    // Bologna
    {
      cityName: "Bologna",
      latitude: 44.4940,
      longitude: 11.3466,
      guide: "Two Towers — Asinelli and Garisenda, medieval landmarks.",
      images: ["https://picsum.photos/seed/duetorribologna/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Two_Towers,_Bologna"],
    },
    {
      cityName: "Bologna",
      latitude: 44.4939,
      longitude: 11.3426,
      guide: "Piazza Maggiore — porticoed heart of Bologna.",
      images: ["https://picsum.photos/seed/piazza-maggiore/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Piazza_Maggiore"],
      is_guide_premium: true,
    },

    // Palermo
    {
      cityName: "Palermo",
      latitude: 38.1236,
      longitude: 13.3571,
      guide: "Teatro Massimo — grand opera house.",
      images: ["https://picsum.photos/seed/teatromassimo/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Teatro_Massimo"],
    },
    {
      cityName: "Palermo",
      latitude: 38.1157,
      longitude: 13.3603,
      guide: "Palermo Cathedral — layered architecture over centuries.",
      images: ["https://picsum.photos/seed/palermo-cathedral/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Palermo_Cathedral"],
      is_guide_premium: true,
    },

    // Bari
    {
      cityName: "Bari",
      latitude: 41.1317,
      longitude: 16.8698,
      guide: "Basilica di San Nicola — pilgrimage site in Bari Vecchia.",
      images: ["https://picsum.photos/seed/san-nicola/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Basilica_di_San_Nicola"],
    },
    {
      cityName: "Bari",
      latitude: 41.1246,
      longitude: 16.8770,
      guide: "Lungomare — seafront promenade.",
      images: ["https://picsum.photos/seed/lungomare-bari/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Bari"],
      is_guide_premium: true,
    },

    // Genoa
    {
      cityName: "Genoa",
      latitude: 44.4100,
      longitude: 8.9290,
      guide: "Aquarium of Genoa — one of Europe’s largest aquariums.",
      images: ["https://picsum.photos/seed/genoa-aquarium/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Aquarium_of_Genoa"],
    },
    {
      cityName: "Genoa",
      latitude: 44.3947,
      longitude: 8.9727,
      guide: "Boccadasse — colorful seaside neighborhood.",
      images: ["https://picsum.photos/seed/boccadasse/800/600"],
      embedded_links: ["https://en.wikipedia.org/wiki/Boccadasse"],
      is_guide_premium: true,
    },
  ];

  // Convert to table rows (attach FK city id + rotate location types)
  const locationRows = rawLocations
    .map((loc, i) => {
      const cityId = cityIdByName.get(loc.cityName);
      if (!cityId) return null; // city insert may have been skipped if rerun without unique constraint
      
      // Extract name from the guide text (first part before the em dash)
      const name = loc.guide ? loc.guide.split('—')[0].trim() : `Location in ${loc.cityName}`;
      
      return {
        city: cityId,
        is_draft: false,
        name: name,
        type: pickType(i),
        images: loc.images ?? [],
        embedded_links: loc.embedded_links ?? [],
        street: loc.street,
        guide: loc.guide,
        is_guide_premium: !!loc.is_guide_premium,
        latitude: loc.latitude,
        longitude: loc.longitude,
        created_at: sql`NOW()` as unknown as Date,
        modified_at: sql`NOW()` as unknown as Date,
      };
    })
    .filter(Boolean);

  if (locationRows.length > 0) {
    await db.insert(locations).values(locationRows);
  }
}

// Optional: allow running directly (node ts-node seed-italy.ts)
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { db } = require("@/db"); // <- your db bootstrap
  seedItaly(db)
    .then(() => {
      console.log("Seeded Italy cities & locations ✅");
      process.exit(0);
    })
    .catch((e: unknown) => {
      console.error(e);
      process.exit(1);
    });
}