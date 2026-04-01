import { z } from "zod";
import { db } from "../../utils/db";
import { canManageTargetUser } from '../../utils/auth-guards'

const bodySchema = z.object({
  targetUserId: z.number().int().positive(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const { targetUserId, currentPassword, newPassword } = bodySchema.parse(body);

  const currentUser = session.user;

  if (!canManageTargetUser(currentUser, targetUserId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not allowed to change this password.",
    });
  }

  const result = await db.query(
    `
      SELECT id, email, name, role, password_hash, is_active
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [targetUserId]
  );

  const targetUser = result.rows[0];

  if (!targetUser || !targetUser.is_active) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  const isSelfChange = currentUser.id === targetUserId;
  const isAdminChangingOtherUser =
    currentUser.role === "admin" && currentUser.id !== targetUserId;

  if (isSelfChange) {
    if (!currentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is required.",
      });
    }

    const validCurrentPassword = await verifyPassword(
      targetUser.password_hash,
      currentPassword
    );

    if (!validCurrentPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: "Current password is incorrect.",
      });
    }
  }

  if (!isSelfChange && !isAdminChangingOtherUser) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not allowed to change this password.",
    });
  }

  const newPasswordHash = await hashPassword(newPassword);

  await db.query(
    `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
    `,
    [newPasswordHash, targetUserId]
  );

  return {
    success: true,
    message: "Password updated successfully.",
  };
});
