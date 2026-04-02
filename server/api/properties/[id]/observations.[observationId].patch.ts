import { z } from "zod";
import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

const bodySchema = z.object({
  observedAt: z.string().datetime().optional(),
  description: z.string().trim().nullable().optional(),
  severityRating: z.number().int().min(1).max(5).nullable().optional(),
  visibilitySource: z
    .enum([
      "street",
      "sidewalk",
      "alley",
      "public_lot",
      "spoke_with_occupant",
      "other",
    ])
    .optional(),
  occupancyStatus: z
    .enum([
      "unknown",
      "appears_occupied",
      "appears_vacant",
      "confirmed_occupied",
      "confirmed_vacant",
    ])
    .optional(),
  occupancyVerificationMethod: z
    .enum([
      "visual_only",
      "spoke_with_occupant",
      "spoke_with_neighbor",
      "public_record",
      "other",
    ])
    .optional(),
  occupantContactMade: z.boolean().optional(),
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

  const id = parseIdParam(
    getRouterParam(event, "id"),
    "Property ID"
  );
  const observationId = parseIdParam(
    getRouterParam(event, "observationId"),
    "Observation ID"
  );
  const body = bodySchema.parse(await readBody(event));

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.observedAt !== undefined) {
    values.push(body.observedAt);
    updates.push(`observed_at = $${values.length}`);
  }

  if (body.description !== undefined) {
    values.push(body.description);
    updates.push(`description = $${values.length}`);
  }

  if (body.severityRating !== undefined) {
    values.push(body.severityRating);
    updates.push(`severity_rating = $${values.length}`);
  }

  if (body.visibilitySource !== undefined) {
    values.push(body.visibilitySource);
    updates.push(`visibility_source = $${values.length}`);
  }

  if (body.occupancyStatus !== undefined) {
    values.push(body.occupancyStatus);
    updates.push(`occupancy_status = $${values.length}`);
  }

  if (body.occupancyVerificationMethod !== undefined) {
    values.push(body.occupancyVerificationMethod);
    updates.push(`occupancy_verification_method = $${values.length}`);
  }

  if (body.occupantContactMade !== undefined) {
    values.push(body.occupantContactMade);
    updates.push(`occupant_contact_made = $${values.length}`);
  }

  if (body.occupantRelationshipToProperty !== undefined) {
    values.push(body.occupantRelationshipToProperty);
    updates.push(`occupant_relationship_to_property = $${values.length}`);
  }

  if (body.occupantFirstName !== undefined) {
    values.push(body.occupantFirstName);
    updates.push(`occupant_first_name = $${values.length}`);
  }

  if (body.occupantLastName !== undefined) {
    values.push(body.occupantLastName);
    updates.push(`occupant_last_name = $${values.length}`);
  }

  if (body.occupantCount !== undefined) {
    values.push(body.occupantCount);
    updates.push(`occupant_count = $${values.length}`);
  }

  if (body.occupantComment !== undefined) {
    values.push(body.occupantComment);
    updates.push(`occupant_comment = $${values.length}`);
  }

  if (body.notes !== undefined) {
    values.push(body.notes);
    updates.push(`notes = $${values.length}`);
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields were provided for update.",
    });
  }

  values.push(observationId);
  values.push(id);

  const result = await db.query(
    `
      UPDATE property_observations
      SET ${updates.join(", ")}
      WHERE id = $${values.length - 1}
        AND property_id = $${values.length}
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
    values
  );

  if (!result.rows[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Observation not found.",
    });
  }

  return {
    success: true,
    observation: result.rows[0],
  };
});
