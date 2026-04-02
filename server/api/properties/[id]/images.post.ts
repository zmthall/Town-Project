import { z } from "zod";
import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

const bodySchema = z.object({
  imagePath: z.string().trim().min(1),
  caption: z.string().trim().nullable().optional(),
  isPrimary: z.boolean().default(false),
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

  if (body.isPrimary) {
    await db.query(
      `
        UPDATE property_images
        SET is_primary = FALSE
        WHERE property_id = $1
      `,
      [propertyId]
    );
  }

  const result = await db.query(
    `
      INSERT INTO property_images (property_id, image_path, caption, is_primary)
      VALUES ($1, $2, $3, $4)
      RETURNING id, property_id, image_path, caption, is_primary, created_at
    `,
    [propertyId, body.imagePath, body.caption ?? null, body.isPrimary]
  );

  return {
    success: true,
    image: result.rows[0],
  };
});
