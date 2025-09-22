// src/domains/auth/utils/validation/__tests__/authSchema.integration.test.tsx
import { describe, it, expect } from 'vitest';
import { LoginSchema, type LoginFormData } from '../authSchema';
import { ZodError } from 'zod';

describe('LoginSchema Integration Tests', () => {
  describe('7. Schema Validation Integration', () => {
    it('should validate actual form data structures', () => {
      // Valid login data
      const validData: LoginFormData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual({
          email: 'user@example.com', // Should be lowercase
          password: 'password123',
          rememberMe: false,
        });
      }
    });

    it('should handle email validation edge cases from real form inputs', () => {
      // Empty string (common form input)
      const emptyEmailResult = LoginSchema.safeParse({
        email: '',
        password: 'password',
        rememberMe: false,
      });

      expect(emptyEmailResult.success).toBe(false);
      if (!emptyEmailResult.success) {
        expect(emptyEmailResult.error.issues[0].message).toBe(
          'Email is required.'
        );
      }

      // Whitespace only
      const whitespaceEmailResult = LoginSchema.safeParse({
        email: '   ',
        password: 'password',
        rememberMe: false,
      });

      expect(whitespaceEmailResult.success).toBe(false);

      // Invalid email format
      const invalidEmailResult = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password',
        rememberMe: false,
      });

      expect(invalidEmailResult.success).toBe(false);
      if (!invalidEmailResult.success) {
        expect(invalidEmailResult.error.issues[0].message).toBe(
          'Please enter a valid email address'
        );
      }

      // Email with uppercase (should be converted to lowercase)
      const uppercaseEmailResult = LoginSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'password',
        rememberMe: false,
      });

      expect(uppercaseEmailResult.success).toBe(true);
      if (uppercaseEmailResult.success) {
        expect(uppercaseEmailResult.data.email).toBe('user@example.com');
      }
    });

    it('should handle password validation edge cases from real form inputs', () => {
      // Empty password
      const emptyPasswordResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '',
        rememberMe: false,
      });

      expect(emptyPasswordResult.success).toBe(false);
      if (!emptyPasswordResult.success) {
        expect(emptyPasswordResult.error.issues[0].message).toBe(
          'Password is required.'
        );
      }

      // Single character password (should be valid for login)
      const singleCharResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'a',
        rememberMe: false,
      });

      expect(singleCharResult.success).toBe(true);

      // Very long password (should be valid for login)
      const longPasswordResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'a'.repeat(200),
        rememberMe: false,
      });

      expect(longPasswordResult.success).toBe(true);

      // Password with special characters
      const specialCharsResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        rememberMe: false,
      });

      expect(specialCharsResult.success).toBe(true);
    });

    it('should handle rememberMe field variations', () => {
      // Undefined rememberMe (should default to false)
      const undefinedRememberMeResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'password',
        // rememberMe not provided
      });

      expect(undefinedRememberMeResult.success).toBe(true);
      if (undefinedRememberMeResult.success) {
        expect(undefinedRememberMeResult.data.rememberMe).toBe(false);
      }

      // Explicit true
      const trueRememberMeResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'password',
        rememberMe: true,
      });

      expect(trueRememberMeResult.success).toBe(true);
      if (trueRememberMeResult.success) {
        expect(trueRememberMeResult.data.rememberMe).toBe(true);
      }

      // Explicit false
      const falseRememberMeResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'password',
        rememberMe: false,
      });

      expect(falseRememberMeResult.success).toBe(true);
      if (falseRememberMeResult.success) {
        expect(falseRememberMeResult.data.rememberMe).toBe(false);
      }
    });

    it('should provide detailed error information for form integration', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
        rememberMe: false,
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errors = result.error.issues;

        // Should have errors for both email and password
        expect(errors).toHaveLength(2);

        // Find email error
        const emailError = errors.find((err) => err.path.includes('email'));
        expect(emailError).toBeDefined();
        expect(emailError?.message).toBe('Please enter a valid email address');

        // Find password error
        const passwordError = errors.find((err) =>
          err.path.includes('password')
        );
        expect(passwordError).toBeDefined();
        expect(passwordError?.message).toBe('Password is required.');
      }
    });

    it('should handle real-world malformed data gracefully', () => {
      // Null values
      const nullValuesResult = LoginSchema.safeParse({
        email: null,
        password: null,
        rememberMe: null,
      });

      expect(nullValuesResult.success).toBe(false);

      // Wrong types
      const wrongTypesResult = LoginSchema.safeParse({
        email: 123,
        password: true,
        rememberMe: 'yes',
      });

      expect(wrongTypesResult.success).toBe(false);

      // Missing required fields
      const missingFieldsResult = LoginSchema.safeParse({
        rememberMe: true,
      });

      expect(missingFieldsResult.success).toBe(false);

      // Extra fields (should be ignored)
      const extraFieldsResult = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: false,
        extraField: 'should be ignored',
        anotherExtra: 42,
      });

      expect(extraFieldsResult.success).toBe(true);
      if (extraFieldsResult.success) {
        expect(extraFieldsResult.data).toEqual({
          email: 'user@example.com',
          password: 'password123',
          rememberMe: false,
        });
        expect('extraField' in extraFieldsResult.data).toBe(false);
      }
    });

    it('should preserve data transformation consistency', () => {
      const inputData = {
        email: '  USER@EXAMPLE.COM  ',
        password: 'MyPassword123',
        rememberMe: true,
      };

      const result = LoginSchema.safeParse(inputData);
      expect(result.success).toBe(true);

      if (result.success) {
        // Email should be lowercased and trimmed
        expect(result.data.email).toBe('user@example.com');

        // Password should be unchanged
        expect(result.data.password).toBe('MyPassword123');

        // RememberMe should be preserved
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it('should handle international email addresses', () => {
      const internationalEmails = [
        'user@münchen.de',
        'тест@example.com',
        'user@中文.com',
        'user@example.مصر',
      ];

      internationalEmails.forEach((email) => {
        const result = LoginSchema.safeParse({
          email,
          password: 'password',
          rememberMe: false,
        });

        // Note: This test documents current behavior -
        // international domains may or may not be supported depending on Zod's implementation
        if (result.success) {
          expect(result.data.email).toBe(email.toLowerCase());
        }
      });
    });

    it('should handle edge cases in email transformation', () => {
      const edgeCaseEmails = [
        'User+Tag@Example.Com',
        'user.name+tag@example.co.uk',
        'user123@sub.example.com',
        'a@b.co',
      ];

      edgeCaseEmails.forEach((email) => {
        const result = LoginSchema.safeParse({
          email,
          password: 'password',
          rememberMe: false,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe(email.toLowerCase().trim());
        }
      });
    });

    it('should validate complete form submission data structures', () => {
      // Simulate data from a real form submission
      const formSubmissionData = {
        email: 'newuser@company.com',
        password: 'SecurePass123!',
        rememberMe: true,
      };

      const result = LoginSchema.safeParse(formSubmissionData);
      expect(result.success).toBe(true);

      if (result.success) {
        // Verify the result can be used directly for API calls
        expect(typeof result.data.email).toBe('string');
        expect(typeof result.data.password).toBe('string');
        expect(typeof result.data.rememberMe).toBe('boolean');

        // Verify no unexpected properties
        const keys = Object.keys(result.data);
        expect(keys).toEqual(['email', 'password', 'rememberMe']);
      }
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = performance.now();

      // Validate multiple form submissions
      for (let i = 0; i < 1000; i++) {
        LoginSchema.safeParse({
          email: `user${i}@example.com`,
          password: `password${i}`,
          rememberMe: i % 2 === 0,
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms for 1000 validations)
      expect(duration).toBeLessThan(100);
    });

    it('should provide consistent error structures for UI integration', () => {
      const invalidData = {
        email: '',
        password: '',
        rememberMe: false,
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const error = result.error as ZodError;

        // Should be a ZodError instance
        expect(error).toBeInstanceOf(ZodError);

        // Should have issues array
        expect(Array.isArray(error.issues)).toBe(true);

        // Each issue should have required properties for UI integration
        error.issues.forEach((issue) => {
          expect(issue).toHaveProperty('path');
          expect(issue).toHaveProperty('message');
          expect(issue).toHaveProperty('code');
          expect(Array.isArray(issue.path)).toBe(true);
        });
      }
    });
  });
});
