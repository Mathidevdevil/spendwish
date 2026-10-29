import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
  passwordSchema,
} from "@/schemas/auth";

describe("Auth Validation Schemas", () => {
  describe("passwordSchema", () => {
    it("accepts strong passwords with letters, numbers, and 8+ characters", () => {
      const result = passwordSchema.safeParse("Secret1234");
      expect(result.success).toBe(true);
    });

    it("rejects passwords under 8 characters", () => {
      const result = passwordSchema.safeParse("Pass1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 8 characters");
      }
    });

    it("rejects passwords with no letters", () => {
      const result = passwordSchema.safeParse("12345678");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes("letter"))).toBe(true);
      }
    });

    it("rejects passwords with no numbers", () => {
      const result = passwordSchema.safeParse("PasswordOnly");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes("number"))).toBe(true);
      }
    });
  });

  describe("loginSchema", () => {
    it("validates valid login input", () => {
      const input = {
        email: "user@example.com",
        password: "Password123",
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const input = {
        email: "not-an-email",
        password: "Password123",
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects password shorter than 8 characters", () => {
      const input = {
        email: "user@example.com",
        password: "123",
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("validates complete and matching signup data", () => {
      const input = {
        fullName: "Aarav Sharma",
        email: "aarav@spendwise.app",
        password: "SecurePassword1",
        confirmPassword: "SecurePassword1",
      };
      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects mismatched confirm password", () => {
      const input = {
        fullName: "Aarav Sharma",
        email: "aarav@spendwise.app",
        password: "SecurePassword1",
        confirmPassword: "DifferentPassword2",
      };
      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message === "Passwords do not match")).toBe(true);
      }
    });

    it("rejects short full name", () => {
      const input = {
        fullName: "A",
        email: "aarav@spendwise.app",
        password: "SecurePassword1",
        confirmPassword: "SecurePassword1",
      };
      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates correct email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "user@example.com" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "invalid-email" });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("validates new matching password", () => {
      const result = updatePasswordSchema.safeParse({
        password: "NewSecretPassword1",
        confirmPassword: "NewSecretPassword1",
      });
      expect(result.success).toBe(true);
    });

    it("rejects weak new password", () => {
      const result = updatePasswordSchema.safeParse({
        password: "weak",
        confirmPassword: "weak",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched new password", () => {
      const result = updatePasswordSchema.safeParse({
        password: "NewSecretPassword1",
        confirmPassword: "MismatchPassword2",
      });
      expect(result.success).toBe(false);
    });
  });
});

