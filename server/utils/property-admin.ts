export function assertAdminUser(user: { role?: string | null }) {
  if (user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access only.",
    });
  }
}
