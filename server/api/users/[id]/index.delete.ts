import { db } from "../../../utils/db";
import {
  PROTECTED_ADMIN_EMAIL,
  canManageTargetUser,
} from "../../../utils/auth-guards";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

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

  const currentUser = session.user;

  // Permission check
  if (!canManageTargetUser(currentUser, targetUserId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not allowed to delete this account.",
    });
  }

  // Fetch target user
  const result = await db.query(
    `
      SELECT id, email, name, role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [targetUserId]
  );

  const targetUser = result.rows[0];

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  // Protect main admin account
  if (targetUser.email === PROTECTED_ADMIN_EMAIL) {
    throw createError({
      statusCode: 403,
      statusMessage: "The protected admin account cannot be deleted.",
    });
  }

  // Delete user
  await db.query(
    `
      DELETE FROM users
      WHERE id = $1
    `,
    [targetUserId]
  );

  // If user deletes themselves → clear session
  if (currentUser.id === targetUserId) {
    await clearUserSession(event);
  }

  return {
    success: true,
    message:
      currentUser.id === targetUserId
        ? "Your account has been deleted."
        : "User account has been deleted.",
  };
});
