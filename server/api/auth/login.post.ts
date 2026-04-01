import { z } from "zod";
import { db } from "../../utils/db"

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = bodySchema.parse(body);

  const result = await db.query(
    `
      SELECT id, email, name, role, password_hash, is_active
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  const dbUser = result.rows[0];

  if (!dbUser || !dbUser.is_active) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  const isValidPassword = await verifyPassword(dbUser.password_hash, password);

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  await setUserSession(event, {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    },
    loggedInAt: Date.now(),
  });

  return {
    success: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    },
  };
});
