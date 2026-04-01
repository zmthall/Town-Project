import { z } from "zod";
import { db } from "../../utils/db";

const bodySchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(200),
  role: z.enum(["admin", "user"]).default("user"),
  isActive: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admin users can create accounts.",
    });
  }

  const body = await readBody(event);
  const { email, name, password, role, isActive } = bodySchema.parse(body);

  const existingUserResult = await db.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (existingUserResult.rows.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "An account with this email already exists.",
    });
  }

  const passwordHash = await hashPassword(password);

  const insertResult = await db.query(
    `
      INSERT INTO users (email, name, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `,
    [email, name, passwordHash, role, isActive]
  );

  return {
    success: true,
    user: insertResult.rows[0],
  };
});
