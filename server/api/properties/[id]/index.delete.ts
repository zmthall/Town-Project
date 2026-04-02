import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  assertAdminUser(session.user);

  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");

  const result = await db.query(
    `
      DELETE FROM properties
      WHERE id = $1
      RETURNING id
    `,
    [propertyId]
  );

  if (!result.rows[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Property not found.",
    });
  }

  return {
    success: true,
    message: "Property deleted successfully.",
  };
});
