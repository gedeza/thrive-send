import { z } from "zod";

// Client validation schemas
export const ClientStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'LEAD', 'ARCHIVED']);

export const ClientTypeEnum = z.enum([
  'MUNICIPALITY', 
  'BUSINESS', 
  'STARTUP', 
  'INDIVIDUAL', 
  'NONPROFIT'
]);

export const CreateClientSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email format")
    .toLowerCase(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 digits")
    .regex(/^[\+]?[1-9][\d\s\-\(\)]{7,18}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  industry: z.string()
    .max(100, "Industry must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  type: ClientTypeEnum,
  website: z.string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      if (!val) return undefined;
      // Add protocol if missing
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        return `https://${val}`;
      }
      return val;
    }),
  status: ClientStatusEnum.default('ACTIVE'),
  logoUrl: z.string()
    .url("Invalid logo URL")
    .optional()
    .or(z.literal("")),
  organizationId: z.string()
    .cuid("Invalid organization ID format")
});

export const UpdateClientSchema = CreateClientSchema.partial().extend({
  id: z.string().cuid("Invalid client ID format")
});

// Project validation schemas
export const ProjectStatusEnum = z.enum([
  'PLANNED', 
  'IN_PROGRESS', 
  'ON_HOLD', 
  'COMPLETED', 
  'CANCELLED'
]);

const BaseProjectSchema = z.object({
  name: z.string()
    .min(2, "Project name must be at least 2 characters")
    .max(200, "Project name must be less than 200 characters")
    .trim(),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  status: ProjectStatusEnum.default('PLANNED'),
  startDate: z.string()
    .datetime("Invalid start date format")
    .optional(),
  endDate: z.string()
    .datetime("Invalid end date format")
    .optional(),
  clientId: z.string()
    .cuid("Invalid client ID format")
    .optional(),
  organizationId: z.string()
    .cuid("Invalid organization ID format"),
  managerId: z.string()
    .cuid("Invalid manager ID format")
    .optional()
});

export const CreateProjectSchema = BaseProjectSchema.refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const UpdateProjectSchema = BaseProjectSchema.partial().extend({
  id: z.string().cuid("Invalid project ID format")
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Query parameter schemas
export const PaginationSchema = z.object({
  page: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Page must be at least 1")
    .default("1"),
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100")
    .default("20"),
  sortBy: z.string()
    .max(50, "Sort field name too long")
    .optional(),
  sortOrder: z.enum(['asc', 'desc'])
    .default('asc')
});

export const ClientFilterSchema = z.object({
  status: z.union([ClientStatusEnum, z.literal('all')])
    .default('all'),
  type: z.union([ClientTypeEnum, z.literal('all')])
    .default('all'),
  industry: z.union([
    z.string().max(100, "Industry filter too long"), 
    z.null(), 
    z.undefined()
  ]).transform(val => val || undefined),
  search: z.union([
    z.string().max(200, "Search term too long"), 
    z.null(), 
    z.undefined()
  ]).transform(val => val || undefined)
});

export const ProjectFilterSchema = z.object({
  status: z.union([ProjectStatusEnum, z.literal('all')])
    .default('all'),
  clientId: z.string()
    .cuid("Invalid client ID format")
    .optional(),
  search: z.string()
    .max(200, "Search term too long")
    .optional()
});

// Organization validation - supports both internal CUIDs and Clerk organization IDs  
export const OrganizationIdSchema = z.string()
  .min(1, "Organization ID is required")
  .refine(
    (id) => {
      // Allow Clerk organization IDs (start with 'org_')
      if (id.startsWith('org_')) return id.length > 4;
      // Allow internal CUID format (25 chars starting with 'c')
      return /^c[0-9a-z]{24}$/i.test(id);
    },
    { message: "Invalid organization ID format" }
  );

// ID validation helpers
export const CuidSchema = z.string()
  .cuid("Invalid ID format");

export const EmailSchema = z.string()
  .email("Invalid email format")
  .toLowerCase();

export const UrlSchema = z.string()
  .url("Invalid URL format");

// Bulk operation schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(CuidSchema)
    .min(1, "At least one ID is required")
    .max(50, "Cannot delete more than 50 items at once")
});

export const BulkUpdateStatusSchema = z.object({
  ids: z.array(CuidSchema)
    .min(1, "At least one ID is required")
    .max(50, "Cannot update more than 50 items at once"),
  status: z.union([ClientStatusEnum, ProjectStatusEnum])
});

// Export validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Export async validation helper
export async function validateRequestAsync<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}