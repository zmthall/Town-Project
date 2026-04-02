export function parseIdParam(value: string | undefined, label = "ID") {
  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is required.`,
    });
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid ${label.toLowerCase()}.`,
    });
  }

  return parsed;
}
