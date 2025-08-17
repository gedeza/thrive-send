import { describe, it, expect } from '@jest/globals';
import {
  clientValidationSchema,
  createClientSchema,
  updateClientSchema,
  validateClientForm,
  validateCreateClient,
  validateUpdateClient,
  isValidEmail,
  isValidPhoneNumber,
  isValidURL,
  sanitizeClientInput,
  formatPhoneNumber,
} from '@/lib/validation/client-validation';

describe('Client Validation', () => {
  describe('clientValidationSchema', () => {
    const validClientData = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '+1234567890',
      address: '123 Test St',
      type: 'BUSINESS',
      industry: 'TECHNOLOGY',
      website: 'https://example.com',
      logoUrl: 'https://example.com/logo.png',
      monthlyBudget: 5000,
      organizationId: 'org-123',
    };

    it('validates valid client data', () => {
      const result = clientValidationSchema.safeParse(validClientData);
      expect(result.success).toBe(true);
    });

    it('requires name with minimum length', () => {
      const result = clientValidationSchema.safeParse({
        ...validClientData,
        name: 'a',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('at least 2 characters');
    });

    it('validates name format', () => {
      const result = clientValidationSchema.safeParse({
        ...validClientData,
        name: 'Test <script>alert("xss")</script>',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('invalid characters');
    });

    it('requires valid email format', () => {
      const result = clientValidationSchema.safeParse({
        ...validClientData,
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('valid email');
    });

    it('validates phone number format', () => {
      const validPhone = clientValidationSchema.safeParse({
        ...validClientData,
        phone: '+1 (555) 123-4567',
      });
      expect(validPhone.success).toBe(true);

      const invalidPhone = clientValidationSchema.safeParse({
        ...validClientData,
        phone: 'invalid-phone',
      });
      expect(invalidPhone.success).toBe(false);
    });

    it('validates client type enum', () => {
      const result = clientValidationSchema.safeParse({
        ...validClientData,
        type: 'INVALID_TYPE',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Invalid client type');
    });

    it('validates industry enum', () => {
      const result = clientValidationSchema.safeParse({
        ...validClientData,
        industry: 'INVALID_INDUSTRY',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Invalid industry');
    });

    it('transforms website URL to include protocol', () => {
      const result = clientValidationSchema.safeParse({
        ...validClientData,
        website: 'example.com',
      });
      expect(result.success).toBe(true);
      expect(result.data?.website).toBe('https://example.com');
    });

    it('validates logo URL format', () => {
      const validLogo = clientValidationSchema.safeParse({
        ...validClientData,
        logoUrl: 'https://example.com/logo.jpg',
      });
      expect(validLogo.success).toBe(true);

      const invalidLogo = clientValidationSchema.safeParse({
        ...validClientData,
        logoUrl: 'https://example.com/document.pdf',
      });
      expect(invalidLogo.success).toBe(false);
    });

    it('validates monthly budget range', () => {
      const negativeBudget = clientValidationSchema.safeParse({
        ...validClientData,
        monthlyBudget: -1000,
      });
      expect(negativeBudget.success).toBe(false);

      const excessiveBudget = clientValidationSchema.safeParse({
        ...validClientData,
        monthlyBudget: 20000000,
      });
      expect(excessiveBudget.success).toBe(false);
    });

    it('allows optional fields to be undefined', () => {
      const minimalData = {
        name: 'Test Client',
        email: 'test@example.com',
        type: 'BUSINESS',
        organizationId: 'org-123',
      };
      const result = clientValidationSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('createClientSchema', () => {
    it('requires organizationId for creation', () => {
      const dataWithoutOrgId = {
        name: 'Test Client',
        email: 'test@example.com',
        type: 'BUSINESS',
      };
      const result = createClientSchema.safeParse(dataWithoutOrgId);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Organization ID is required');
    });
  });

  describe('updateClientSchema', () => {
    it('allows partial updates', () => {
      const partialData = {
        name: 'Updated Name',
      };
      const result = updateClientSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('does not require organizationId for updates', () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const result = updateClientSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation helper functions', () => {
    describe('validateClientForm', () => {
      it('returns success for valid data', () => {
        const validData = {
          name: 'Test Client',
          email: 'test@example.com',
          type: 'BUSINESS',
          organizationId: 'org-123',
        };
        const result = validateClientForm(validData);
        expect(result.success).toBe(true);
      });

      it('returns error for invalid data', () => {
        const invalidData = {
          name: '',
          email: 'invalid-email',
        };
        const result = validateClientForm(invalidData);
        expect(result.success).toBe(false);
        expect(result.error?.issues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Custom validation helpers', () => {
    describe('isValidEmail', () => {
      it('validates correct email formats', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.za')).toBe(true);
      });

      it('rejects invalid email formats', () => {
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('@domain.com')).toBe(false);
      });
    });

    describe('isValidPhoneNumber', () => {
      it('validates correct phone formats', () => {
        expect(isValidPhoneNumber('+1234567890')).toBe(true);
        expect(isValidPhoneNumber('1234567890')).toBe(true);
        expect(isValidPhoneNumber('+1 (555) 123-4567')).toBe(true);
      });

      it('rejects invalid phone formats', () => {
        expect(isValidPhoneNumber('invalid-phone')).toBe(false);
        expect(isValidPhoneNumber('123')).toBe(false);
      });

      it('allows empty phone number (optional field)', () => {
        expect(isValidPhoneNumber('')).toBe(true);
      });
    });

    describe('isValidURL', () => {
      it('validates correct URL formats', () => {
        expect(isValidURL('https://example.com')).toBe(true);
        expect(isValidURL('http://example.com')).toBe(true);
        expect(isValidURL('example.com')).toBe(true);
      });

      it('rejects invalid URL formats', () => {
        expect(isValidURL('invalid-url')).toBe(false);
        expect(isValidURL('ht://invalid')).toBe(false);
      });

      it('allows empty URL (optional field)', () => {
        expect(isValidURL('')).toBe(true);
      });
    });
  });

  describe('Sanitization helpers', () => {
    describe('sanitizeClientInput', () => {
      it('removes XSS characters', () => {
        const input = 'Test <script>alert("xss")</script> Name';
        const result = sanitizeClientInput(input);
        expect(result).toBe('Test script>alert("xss")/script Name');
      });

      it('trims whitespace', () => {
        const input = '   Test Name   ';
        const result = sanitizeClientInput(input);
        expect(result).toBe('Test Name');
      });

      it('limits length', () => {
        const longInput = 'a'.repeat(2000);
        const result = sanitizeClientInput(longInput);
        expect(result.length).toBe(1000);
      });
    });

    describe('formatPhoneNumber', () => {
      it('formats 10-digit US phone numbers', () => {
        const result = formatPhoneNumber('5551234567');
        expect(result).toBe('(555) 123-4567');
      });

      it('leaves other formats unchanged', () => {
        const input = '+1-555-123-4567';
        const result = formatPhoneNumber(input);
        expect(result).toBe(input);
      });
    });
  });
});