import { z } from "zod";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  // Temporary hard-coded admin login for learning/dev
  // Replace this with PostgreSQL lookup next
  const adminEmail = "admin@townproject.com";
  const adminPassword = "ChangeMe123!";

  if (email !== adminEmail || password !== adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  await setUserSession(event, {
    user: {
      id: 1,
      email: adminEmail,
      name: "Admin",
      role: "admin",
    },
    loggedInAt: Date.now(),
  });

  return {
    success: true,
  };
});
