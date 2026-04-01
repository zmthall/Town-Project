export const PROTECTED_ADMIN_EMAIL = "admin@townproject.com";

export function isAdminUser(user: { role?: string | null }) {
  return user.role === "admin";
}

export function canManageTargetUser(
  currentUser: { id: number; role?: string | null },
  targetUserId: number
) {
  if (currentUser.id === targetUserId) {
    return true;
  }

  return isAdminUser(currentUser);
}
