import { z } from "zod";
import { db } from "../../../utils/db";
import { canManageTargetUser } from "../../../utils/auth-guards";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
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
      statusMessage: "You are not allowed to update this user name.",
    });
  }

  const body = await readBody(event);
  const { name } = bodySchema.parse(body);

  const result = await db.query(
    `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `,
    [name, targetUserId]
  );

  const updatedUser = result.rows[0];

  if (!updatedUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found.",
    });
  }

  if (session.user.id === targetUserId) {
    await setUserSession(event, {
      user: {
        ...session.user,
        name: updatedUser.name,
      },
      loggedInAt: session.loggedInAt,
    });
  }

  return {
    success: true,
    user: updatedUser,
  };
});
