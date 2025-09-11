import { z } from 'zod';
import { errorLogger } from '@/lib/error/errorLogger';

export class ValidationError extends Error {
  constructor(message: string, public errors: z.ZodError) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      const validationError = new ValidationError('Data validation failed', error);
      
      // Log validation error
      errorLogger.log(validationError, {
        variant: 'warning',
        context: {
          errors: error.errors,
          data,
        },
      });

      throw validationError;
    }
    throw _error;
  }
}

// Common validation schemas
export const schemas = {
  email: z.string().email(),
  url: z.string().url(),
  date: z.string().datetime(),
  number: z.number(),
  integer: z.number().int(),
  positive: z.number().positive(),
  nonNegative: z.number().nonnegative(),
  string: z.string(),
  nonEmptyString: z.string().min(1),
  boolean: z.boolean(),
  array: z.array(z.unknown()),
  nonEmptyArray: z.array(z.unknown()).min(1),
  object: z.record(z.unknown()),
  nonEmptyObject: z.record(z.unknown()).refine(
    (obj) => Object.keys(obj).length > 0,
    'Object must not be empty'
  ),
};

// Type guards
export function isEmail(value: unknown): value is string {
  return schemas.email.safeParse(value).success;
}

export function isUrl(value: unknown): value is string {
  return schemas.url.safeParse(value).success;
}

export function isDate(value: unknown): value is string {
  return schemas.date.safeParse(value).success;
}

export function isNumber(value: unknown): value is number {
  return schemas.number.safeParse(value).success;
}

export function isInteger(value: unknown): value is number {
  return schemas.integer.safeParse(value).success;
}

export function isPositive(value: unknown): value is number {
  return schemas.positive.safeParse(value).success;
}

export function isNonNegative(value: unknown): value is number {
  return schemas.nonNegative.safeParse(value).success;
}

export function isString(value: unknown): value is string {
  return schemas.string.safeParse(value).success;
}

export function isNonEmptyString(value: unknown): value is string {
  return schemas.nonEmptyString.safeParse(value).success;
}

export function isBoolean(value: unknown): value is boolean {
  return schemas.boolean.safeParse(value).success;
}

export function isArray(value: unknown): value is unknown[] {
  return schemas.array.safeParse(value).success;
}

export function isNonEmptyArray(value: unknown): value is unknown[] {
  return schemas.nonEmptyArray.safeParse(value).success;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return schemas.object.safeParse(value).success;
}

export function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return schemas.nonEmptyObject.safeParse(value).success;
}

// Data transformation utilities
export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

export function sanitizeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function sanitizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

export function sanitizeArray<T>(value: unknown, transform: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(transform);
}

export function sanitizeObject<T>(
  value: unknown,
  transform: (key: string, val: unknown) => [string, T]
): Record<string, T> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => transform(key, val))
  );
} 