import { z } from "zod";
import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

const bodySchema = z.object({
  imagePath: z.string().trim().min(1).optional(),
  caption: z.string().trim().nullable().optional(),
  isPrimary: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  assertAdminUser(session.user);

  const id = parseIdParam(
    getRouterParam(event, "id"),
    "Property ID"
  );
  const imageId = parseIdParam(getRouterParam(event, "imageId"), "Image ID");
  const body = bodySchema.parse(await readBody(event));

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.imagePath !== undefined) {
    values.push(body.imagePath);
    updates.push(`image_path = $${values.length}`);
  }

  if (body.caption !== undefined) {
    values.push(body.caption);
    updates.push(`caption = $${values.length}`);
  }

  if (body.isPrimary !== undefined) {
    if (body.isPrimary) {
      await db.query(
        `
          UPDATE property_images
          SET is_primary = FALSE
          WHERE property_id = $1
        `,
        [id]
      );
    }

    values.push(body.isPrimary);
    updates.push(`is_primary = $${values.length}`);
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields were provided for update.",
    });
  }

  values.push(imageId);
  values.push(id);

  const result = await db.query(
    `
      UPDATE property_images
      SET ${updates.join(", ")}
      WHERE id = $${values.length - 1}
        AND property_id = $${values.length}
      RETURNING id, property_id, image_path, caption, is_primary, created_at
    `,
    values
  );

  if (!result.rows[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Image not found.",
    });
  }

  return {
    success: true,
    image: result.rows[0],
  };
});
