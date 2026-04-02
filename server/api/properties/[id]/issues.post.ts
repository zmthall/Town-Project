import { z } from "zod";
import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

const bodySchema = z.object({
  issueCode: z.enum([
    "boarded_up",
    "fire_damage",
    "falling_apart",
    "mid_demolition",
    "broken_windows",
    "unsecured_entry",
    "roof_damage",
    "structural_damage",
    "graffiti",
    "trash_debris",
    "overgrown_lot",
    "water_damage",
    "foundation_damage",
    "unsafe_stairs_or_porches",
    "other",
  ]),
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
      INSERT INTO property_issues (property_id, issue_code)
      VALUES ($1, $2)
      RETURNING id, property_id, issue_code, created_at
    `,
    [propertyId, body.issueCode]
  );

  return {
    success: true,
    issue: result.rows[0],
  };
});
