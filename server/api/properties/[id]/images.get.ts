import { db } from "../../../utils/db";
import { parseIdParam } from "../../../utils/property-parsers";

export default defineEventHandler(async (event) => {
  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");

  const result = await db.query(
    `
      SELECT
        id,
        property_id,
        image_path,
        caption,
        is_primary,
        created_at
      FROM property_images
      WHERE property_id = $1
      ORDER BY is_primary DESC, id ASC
    `,
    [propertyId]
  );

  return {
    success: true,
    images: result.rows,
  };
});
