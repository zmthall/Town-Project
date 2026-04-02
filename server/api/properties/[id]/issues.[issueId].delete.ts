import { db } from "../../../utils/db";
import { assertAdminUser } from "../../../utils/property-admin";
import { parseIdParam } from "../../../utils/property-parsers";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  assertAdminUser(session.user);

  const id = parseIdParam(
    getRouterParam(event, "id"),
    "Property ID"
  );
  const issueId = parseIdParam(getRouterParam(event, "issueId"), "Issue ID");

  const result = await db.query(
    `
      DELETE FROM property_issues
      WHERE id = $1
        AND property_id = $2
      RETURNING id
    `,
    [issueId, id]
  );

  if (!result.rows[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Issue not found.",
    });
  }

  return {
    success: true,
    message: "Issue deleted successfully.",
  };
});
