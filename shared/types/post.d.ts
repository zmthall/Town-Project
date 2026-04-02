declare module "#property-post" {
  type BuildingType =
    | "residential"
    | "commercial"
    | "industrial"
    | "mixed_use"
    | "public"
    | "unknown";

  type PropertyStatus = "active" | "improved" | "demolished" | "archived";

  type PropertyIssueCode =
    | "boarded_up"
    | "fire_damage"
    | "falling_apart"
    | "mid_demolition"
    | "broken_windows"
    | "unsecured_entry"
    | "roof_damage"
    | "structural_damage"
    | "graffiti"
    | "trash_debris"
    | "overgrown_lot"
    | "water_damage"
    | "foundation_damage"
    | "unsafe_stairs_or_porches"
    | "other";

  type VisibilitySource =
    | "street"
    | "sidewalk"
    | "alley"
    | "public_lot"
    | "spoke_with_occupant"
    | "other";

  type OccupancyStatus =
    | "unknown"
    | "appears_occupied"
    | "appears_vacant"
    | "confirmed_occupied"
    | "confirmed_vacant";

  type OccupancyVerificationMethod =
    | "visual_only"
    | "spoke_with_occupant"
    | "spoke_with_neighbor"
    | "public_record"
    | "other";

  type OccupantRelationshipToProperty =
    | "owner"
    | "renter"
    | "resident_unknown"
    | "not_provided";

  interface PropertyRecord {
    id: number;
    address: string;
    zipCode: string | null;
    buildingType: BuildingType;
    status: PropertyStatus;
    latitude: number | null;
    longitude: number | null;
    severityRating: number | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface PropertyListRecord extends PropertyRecord {
    primaryImagePath: string | null;
    issueCodes: PropertyIssueCode[];
  }

  interface PropertyIssueRecord {
    id: number;
    propertyId: number;
    issueCode: PropertyIssueCode;
    createdAt?: string;
  }

  interface PropertyImageRecord {
    id: number;
    propertyId: number;
    imagePath: string;
    caption: string | null;
    isPrimary: boolean;
    createdAt: string;
  }

  interface PropertyObservationRecord {
    id: number;
    propertyId: number;
    observedAt: string;
    description: string | null;
    severityRating: number | null;
    visibilitySource: VisibilitySource;
    occupancyStatus: OccupancyStatus;
    occupancyVerificationMethod: OccupancyVerificationMethod;
    occupantContactMade: boolean;
    occupantRelationshipToProperty: OccupantRelationshipToProperty | null;
    occupantFirstName: string | null;
    occupantLastName: string | null;
    occupantCount: number | null;
    occupantComment: string | null;
    notes: string | null;
    createdAt?: string;
    updatedAt?: string;
  }

  interface PropertyWithRelations extends PropertyRecord {
    issues: PropertyIssueRecord[];
    images: PropertyImageRecord[];
    observations: PropertyObservationRecord[];
  }

  interface CreatePropertyInput {
    address: string;
    zipCode?: string | null;
    buildingType?: BuildingType;
    status?: PropertyStatus;
    latitude?: number | null;
    longitude?: number | null;
    severityRating?: number | null;
    description?: string | null;
  }

  interface UpdatePropertyInput {
    address?: string;
    zipCode?: string | null;
    buildingType?: BuildingType;
    status?: PropertyStatus;
    latitude?: number | null;
    longitude?: number | null;
    severityRating?: number | null;
    description?: string | null;
  }

  interface CreatePropertyIssueInput {
    propertyId: number;
    issueCode: PropertyIssueCode;
  }

  interface CreatePropertyImageInput {
    propertyId: number;
    imagePath: string;
    caption?: string | null;
    isPrimary?: boolean;
  }

  interface CreatePropertyObservationInput {
    propertyId: number;
    observedAt: string;
    description?: string | null;
    severityRating?: number | null;
    visibilitySource: VisibilitySource;
    occupancyStatus?: OccupancyStatus;
    occupancyVerificationMethod?: OccupancyVerificationMethod;
    occupantContactMade?: boolean;
    occupantRelationshipToProperty?: OccupantRelationshipToProperty | null;
    occupantFirstName?: string | null;
    occupantLastName?: string | null;
    occupantCount?: number | null;
    occupantComment?: string | null;
    notes?: string | null;
  }

  interface PaginationMeta {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  type PropertyIssueSummary = Partial<Record<PropertyIssueCode, number>>;

  interface PaginatedPropertyListResponse {
    success: true;
    properties: PropertyListRecord[];
    pagination: PaginationMeta;
    issueSummary: PropertyIssueSummary;
  }

  interface SinglePropertyResponse {
    success: true;
    property: PropertyWithRelations;
  }
}

export {};
