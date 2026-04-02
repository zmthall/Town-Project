import { db } from "../../../utils/db";
import { parseIdParam } from "../../../utils/property-parsers";

export default defineEventHandler(async (event) => {
  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");

  const result = await db.query(
    `
      SELECT
        id,
        property_id,
        issue_code,
        created_at
      FROM property_issues
      WHERE property_id = $1
      ORDER BY id ASC
    `,
    [propertyId]
  );

  return {
    success: true,
    issues: result.rows,
  };
});
