export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  return {
    success: true,
    message: "Authenticated admin route access confirmed.",
    user: session.user,
  };
});
