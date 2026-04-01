import { z } from "zod";
import { db } from "../../../utils/db";
import { PROTECTED_ADMIN_EMAIL, isAdminUser } from "../../../utils/auth-guards";

const bodySchema = z.object({
  role: z.enum(["admin", "user"]),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!isAdminUser(session.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admin users can update roles.",
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

  const body = await readBody(event);
  const { role } = bodySchema.parse(body);

  const targetResult = await db.query(
    `
      SELECT id, email, role
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

  if (targetUser.email === PROTECTED_ADMIN_EMAIL && role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "The protected admin account role cannot be changed.",
    });
  }

  const result = await db.query(
    `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `,
    [role, targetUserId]
  );

  const updatedUser = result.rows[0];

  if (session.user.id === targetUserId) {
    await setUserSession(event, {
      user: {
        ...session.user,
        role: updatedUser.role,
      },
      loggedInAt: session.loggedInAt
    });
  }

  return {
    success: true,
    user: updatedUser,
  };
});
