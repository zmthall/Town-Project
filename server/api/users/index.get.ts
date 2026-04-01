import { db } from "../../utils/db";
import { isAdminUser } from "../../utils/auth-guards";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!isAdminUser(session.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admin users can view all users.",
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
      ORDER BY id ASC
    `
  );

  return {
    success: true,
    users: result.rows,
  };
});
