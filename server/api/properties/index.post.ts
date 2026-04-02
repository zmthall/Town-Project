import { z } from "zod";
import { db } from "../../utils/db";
import { assertAdminUser } from "../../utils/property-admin";

const bodySchema = z.object({
  address: z.string().trim().min(1).max(255),
  zipCode: z.string().trim().max(20).nullable().optional(),
  buildingType: z
    .enum([
      "residential",
      "commercial",
      "industrial",
      "mixed_use",
      "public",
      "unknown",
    ])
    .default("unknown"),
  status: z
    .enum(["active", "improved", "demolished", "archived"])
    .default("active"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  severityRating: z.number().int().min(1).max(5).nullable().optional(),
  description: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  assertAdminUser(session.user);

  const body = bodySchema.parse(await readBody(event));

  const result = await db.query(
    `
      INSERT INTO properties (
        address,
        zip_code,
        building_type,
        status,
        latitude,
        longitude,
        severity_rating,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        address,
        zip_code,
        building_type,
        status,
        latitude,
        longitude,
        severity_rating,
        description,
        created_at,
        updated_at
    `,
    [
      body.address,
      body.zipCode ?? null,
      body.buildingType,
      body.status,
      body.latitude ?? null,
      body.longitude ?? null,
      body.severityRating ?? null,
      body.description ?? null,
    ]
  );

  return {
    success: true,
    property: result.rows[0],
  };
});
