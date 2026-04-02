import { db } from "../../../utils/db";
import { parseIdParam } from "../../../utils/property-parsers";

export default defineEventHandler(async (event) => {
  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");

  const result = await db.query(
    `
      SELECT
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
      FROM property_observations
      WHERE property_id = $1
      ORDER BY observed_at DESC, id DESC
    `,
    [propertyId]
  );

  return {
    success: true,
    observations: result.rows,
  };
});
