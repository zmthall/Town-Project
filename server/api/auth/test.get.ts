export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  return {
    message: "You are authenticated.",
    user: session.user,
  };
});
