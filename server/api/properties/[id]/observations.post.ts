import { z } from "zod";
import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

const bodySchema = z.object({
  observedAt: z.string().datetime(),
  description: z.string().trim().nullable().optional(),
  severityRating: z.number().int().min(1).max(5).nullable().optional(),
  visibilitySource: z.enum([
    "street",
    "sidewalk",
    "alley",
    "public_lot",
    "spoke_with_occupant",
    "other",
  ]),
  occupancyStatus: z
    .enum([
      "unknown",
      "appears_occupied",
      "appears_vacant",
      "confirmed_occupied",
      "confirmed_vacant",
    ])
    .default("unknown"),
  occupancyVerificationMethod: z
    .enum([
      "visual_only",
      "spoke_with_occupant",
      "spoke_with_neighbor",
      "public_record",
      "other",
    ])
    .default("visual_only"),
  occupantContactMade: z.boolean().default(false),
  occupantRelationshipToProperty: z
    .enum(["owner", "renter", "resident_unknown", "not_provided"])
    .nullable()
    .optional(),
  occupantFirstName: z.string().trim().nullable().optional(),
  occupantLastName: z.string().trim().nullable().optional(),
  occupantCount: z.number().int().min(0).nullable().optional(),
  occupantComment: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  assertAdminUser(session.user);

  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");
  const body = bodySchema.parse(await readBody(event));

  const propertyExists = await db.query(
    `SELECT id FROM properties WHERE id = $1 LIMIT 1`,
    [propertyId]
  );

  if (!propertyExists.rows[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Property not found.",
    });
  }

  const result = await db.query(
    `
      INSERT INTO property_observations (
        property_id,
        observed_at,
        description,
        severity_rating,
        visibility_source,
        occupancy_status,
        occupancy_verification_method,
        occupant_contact_made,
        occupant_relationship_to_property,
        occupant_first_name,
        occupant_last_name,
        occupant_count,
        occupant_comment,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING
        id,
        property_id,
        observed_at,
        description,
        severity_rating,
        visibility_source,
        occupancy_status,
        occupancy_verification_method,
        occupant_contact_made,
        occupant_relationship_to_property,
        occupant_first_name,
        occupant_last_name,
        occupant_count,
        occupant_comment,
        notes,
        created_at,
        updated_at
    `,
    [
      propertyId,
      body.observedAt,
      body.description ?? null,
      body.severityRating ?? null,
      body.visibilitySource,
      body.occupancyStatus,
      body.occupancyVerificationMethod,
      body.occupantContactMade,
      body.occupantRelationshipToProperty ?? null,
      body.occupantFirstName ?? null,
      body.occupantLastName ?? null,
      body.occupantCount ?? null,
      body.occupantComment ?? null,
      body.notes ?? null,
    ]
  );

  return {
    success: true,
    observation: result.rows[0],
  };
});
