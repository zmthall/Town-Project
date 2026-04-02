import { db } from "./db";

export async function getPropertyByIdWithRelations(propertyId: number) {
  const propertyResult = await db.query(
    `
      SELECT
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
      FROM properties
      WHERE id = $1
      LIMIT 1
    `,
    [propertyId]
  );

  const property = propertyResult.rows[0];

  if (!property) {
    return null;
  }

  const [issuesResult, imagesResult, observationsResult] = await Promise.all([
    db.query(
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
    ),
    db.query(
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
    ),
    db.query(
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
    ),
  ]);

  return {
    ...property,
    issues: issuesResult.rows,
    images: imagesResult.rows,
    observations: observationsResult.rows,
  };
}
