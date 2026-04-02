import { parseIdParam } from "../../../utils/property-parsers";
import { getPropertyByIdWithRelations } from "../../../utils/property-queries";

export default defineEventHandler(async (event) => {
  const propertyId = parseIdParam(getRouterParam(event, "id"), "Property ID");

  const property = await getPropertyByIdWithRelations(propertyId);

  if (!property) {
    throw createError({
      statusCode: 404,
      statusMessage: "Property not found.",
    });
  }

  return {
    success: true,
    property,
  };
});
