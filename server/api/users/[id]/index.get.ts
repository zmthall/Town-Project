import { db } from "../../../utils/db";
import { isAdminUser } from "../../../utils/auth-guards";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!isAdminUser(session.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admin users can view user accounts.",
    });
  }

  const idParam = getRouterParam(event, "id");

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required.",
    });
  }

  const targetUserId = Number(idParam);

  if (Number.isNaN(targetUserId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID.",
    });
  }

  const result = await db.query(
    `
      SELECT
        id,
        email,
        name,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [targetUserId]
  );

  const user = result.rows[0];

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  return {
    success: true,
    user,
  };
});
