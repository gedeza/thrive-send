import { z } from 'zod';
import { CLIENT_TYPES, INDUSTRY_CATEGORIES } from '@/lib/client-categories';

// Extract valid values for validation
const CLIENT_TYPE_VALUES = CLIENT_TYPES.map(type => type.value) as [string, ...string[]];
const INDUSTRY_VALUES = INDUSTRY_CATEGORIES.map(industry => industry.value) as [string, ...string[]];

// Base client validation schema
export const clientValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&.,()]+$/, "Client name contains invalid characters"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, '')),
      "Please enter a valid phone number"
    ),
  
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  
  type: z
    .enum(CLIENT_TYPE_VALUES, {
      required_error: "Please select a client type",
      invalid_type_error: "Invalid client type selected"
    }),
  
  industry: z
    .enum(INDUSTRY_VALUES, {
      invalid_type_error: "Invalid industry selected"
    })
    .optional(),
  
  website: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return "";
      // Add https:// if no protocol specified
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(val => {
      if (!val) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid website URL"),
  
  logoUrl: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return "";
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(val => {
      if (!val) return true;
      try {
        new URL(val);
        // Additional check for image file extensions
        const url = new URL(val);
        const isImageUrl = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url.pathname) || 
                          url.hostname.includes('logo') ||
                          url.hostname.includes('image') ||
                          url.pathname.includes('logo') ||
                          url.pathname.includes('image');
        return isImageUrl;
      } catch {
        return false;
      }
    }, "Please enter a valid logo image URL"),

  monthlyBudget: z
    .number()
    .min(0, "Budget cannot be negative")
    .max(10000000, "Budget must be less than 10 million")
    .optional(),

  organizationId: z
    .string()
    .min(1, "Organization ID is required"),
});

// Create client schema (includes required organization ID)
export const createClientSchema = clientValidationSchema;

// Update client schema (organization ID not required for updates)
export const updateClientSchema = clientValidationSchema.partial().omit({ organizationId: true });

// API response validation schema
export const clientResponseSchema = z.object({
  id: z.string(),
  displayId: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  type: z.enum(CLIENT_TYPE_VALUES),
  industry: z.enum(INDUSTRY_VALUES).nullable(),
  website: z.string().nullable(),
  logoUrl: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD', 'ARCHIVED']),
  monthlyBudget: z.number().nullable(),
  organizationId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastActivity: z.string().datetime().optional(),
  performanceScore: z.number().optional(),
  projects: z.array(z.any()).optional(),
  socialAccounts: z.array(z.any()).optional(),
});

// Type exports
export type ClientFormData = z.infer<typeof clientValidationSchema>;
export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
export type ClientResponse = z.infer<typeof clientResponseSchema>;

// Validation helper functions
export const validateClientForm = (data: unknown) => {
  return clientValidationSchema.safeParse(data);
};

export const validateCreateClient = (data: unknown) => {
  return createClientSchema.safeParse(data);
};

export const validateUpdateClient = (data: unknown) => {
  return updateClientSchema.safeParse(data);
};

export const validateClientResponse = (data: unknown) => {
  return clientResponseSchema.safeParse(data);
};

// Custom validation helpers
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return /^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone);
};

export const isValidURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

// Sanitization helpers
export const sanitizeClientInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};