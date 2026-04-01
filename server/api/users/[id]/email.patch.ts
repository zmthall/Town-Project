import { z } from "zod";
import { db } from "../../../utils/db";
import {
  PROTECTED_ADMIN_EMAIL,
  canManageTargetUser,
} from "../../../utils/auth-guards";

const bodySchema = z.object({
  email: z.string().trim().email(),
});

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

  if (!canManageTargetUser(session.user, targetUserId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not allowed to update this user email.",
    });
  }

  const body = await readBody(event);
  const { email } = bodySchema.parse(body);

  const targetResult = await db.query(
    `
      SELECT id, email
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [targetUserId]
  );

  const targetUser = targetResult.rows[0];

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  if (
    targetUser.email === PROTECTED_ADMIN_EMAIL &&
    email !== PROTECTED_ADMIN_EMAIL
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "The protected admin account email cannot be changed.",
    });
  }

  const existingEmailResult = await db.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
        AND id <> $2
      LIMIT 1
    `,
    [email, targetUserId]
  );

  if (existingEmailResult.rows.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "An account with this email already exists.",
    });
  }

  const result = await db.query(
    `
      UPDATE users
      SET email = $1
      WHERE id = $2
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `,
    [email, targetUserId]
  );

  const updatedUser = result.rows[0];

  if (session.user.id === targetUserId) {
    await setUserSession(event, {
      user: {
        ...session.user,
        email: updatedUser.email,
      },
      loggedInAt: session.loggedInAt,
    });
  }

  return {
    success: true,
    user: updatedUser,
  };
});
