import { db } from "../../utils/db";

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const buildingType =
    typeof query.buildingType === "string" ? query.buildingType : null;
  const status = typeof query.status === "string" ? query.status : null;
  const search = typeof query.search === "string" ? query.search.trim() : null;

  const page = toPositiveInteger(query.page, 1);
  const perPage = Math.min(toPositiveInteger(query.perPage, 12), 100);
  const offset = (page - 1) * perPage;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (buildingType) {
    values.push(buildingType);
    conditions.push(`p.building_type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`p.status = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(p.address ILIKE $${values.length} OR p.description ILIKE $${values.length})`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await db.query(
    `
      SELECT COUNT(*)::int AS total
      FROM properties p
      ${whereClause}
    `,
    values
  );

  const totalItems = countResult.rows[0]?.total ?? 0;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / perPage);

  const paginatedValues = [...values, perPage, offset];

  const propertyResult = await db.query(
    `
      SELECT
        p.id,
        p.address,
        p.zip_code,
        p.building_type,
        p.status,
        p.latitude,
        p.longitude,
        p.severity_rating,
        p.description,
        p.created_at,
        p.updated_at,
        primary_image.image_path AS primary_image_path,
        COALESCE(issue_list.issue_codes, ARRAY[]::text[]) AS issue_codes
      FROM properties p
      LEFT JOIN LATERAL (
        SELECT image_path
        FROM property_images
        WHERE property_id = p.id
        ORDER BY is_primary DESC, id ASC
        LIMIT 1
      ) AS primary_image ON TRUE
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(issue_code ORDER BY issue_code) AS issue_codes
        FROM property_issues
        WHERE property_id = p.id
      ) AS issue_list ON TRUE
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${paginatedValues.length - 1}
      OFFSET $${paginatedValues.length}
    `,
    paginatedValues
  );

  const issueSummaryResult = await db.query(
    `
      SELECT
        pi.issue_code,
        COUNT(*)::int AS count
      FROM properties p
      INNER JOIN property_issues pi
        ON pi.property_id = p.id
      ${whereClause}
      GROUP BY pi.issue_code
      ORDER BY pi.issue_code ASC
    `,
    values
  );

  const issueSummary = issueSummaryResult.rows.reduce(
    (
      acc: Record<string, number>,
      row: { issue_code: string; count: number }
    ) => {
      acc[row.issue_code] = row.count;
      return acc;
    },
    {}
  );

  return {
    success: true,
    properties: propertyResult.rows.map((row) => ({
      id: row.id,
      address: row.address,
      zipCode: row.zip_code,
      buildingType: row.building_type,
      status: row.status,
      latitude: row.latitude !== null ? Number(row.latitude) : null,
      longitude: row.longitude !== null ? Number(row.longitude) : null,
      severityRating: row.severity_rating,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      primaryImagePath: row.primary_image_path,
      issueCodes: row.issue_codes ?? [],
    })),
    pagination: {
      page,
      perPage,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    issueSummary,
  };
});
