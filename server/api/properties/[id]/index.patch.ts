import { z } from "zod";
import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

const bodySchema = z.object({
  address: z.string().trim().min(1).max(255).optional(),
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
    .optional(),
  status: z.enum(["active", "improved", "demolished", "archived"]).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  severityRating: z.number().int().min(1).max(5).nullable().optional(),
  description: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  assertAdminUser(session.user);

  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");
  const body = bodySchema.parse(await readBody(event));

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.address !== undefined) {
    values.push(body.address);
    updates.push(`address = $${values.length}`);
  }

  if (body.zipCode !== undefined) {
    values.push(body.zipCode);
    updates.push(`zip_code = $${values.length}`);
  }

  if (body.buildingType !== undefined) {
    values.push(body.buildingType);
    updates.push(`building_type = $${values.length}`);
  }

  if (body.status !== undefined) {
    values.push(body.status);
    updates.push(`status = $${values.length}`);
  }

  if (body.latitude !== undefined) {
    values.push(body.latitude);
    updates.push(`latitude = $${values.length}`);
  }

  if (body.longitude !== undefined) {
    values.push(body.longitude);
    updates.push(`longitude = $${values.length}`);
  }

  if (body.severityRating !== undefined) {
    values.push(body.severityRating);
    updates.push(`severity_rating = $${values.length}`);
  }

  if (body.description !== undefined) {
    values.push(body.description);
    updates.push(`description = $${values.length}`);
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields were provided for update.",
    });
  }

  values.push(propertyId);

  const result = await db.query(
    `
      UPDATE properties
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
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
    values
  );

  const property = result.rows[0];

  if (!property) {
    throw createError({
      statusCode: 404,
      statusMessage: "Property not found.",
    });
  }

  return {
    success: true,
    property,
  };
});
