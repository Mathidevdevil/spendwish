import { describe, it, expect } from "vitest";
import { sanitizeRedirectPath } from "@/lib/utils";

describe("sanitizeRedirectPath", () => {
  it("allows safe relative paths", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/transactions")).toBe("/transactions");
    expect(sanitizeRedirectPath("/trips?view=ongoing")).toBe("/trips?view=ongoing");
    expect(sanitizeRedirectPath("/settings#profile")).toBe("/settings#profile");
  });

  it("falls back to default /dashboard for empty or non-string inputs", () => {
    expect(sanitizeRedirectPath(null)).toBe("/dashboard");
    expect(sanitizeRedirectPath(undefined)).toBe("/dashboard");
    expect(sanitizeRedirectPath("")).toBe("/dashboard");
  });

  it("respects custom fallback path", () => {
    expect(sanitizeRedirectPath(null, "/custom-fallback")).toBe("/custom-fallback");
    expect(sanitizeRedirectPath("https://evil.com", "/login")).toBe("/login");
  });

  it("blocks protocol-relative open redirect attacks", () => {
    expect(sanitizeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("///evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("//google.com/test")).toBe("/dashboard");
  });

  it("blocks absolute URL open redirects", () => {
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("http://evil.com/path")).toBe("/dashboard");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
    expect(sanitizeRedirectPath("data:text/html,<html>")).toBe("/dashboard");
  });

  it("blocks backslash attacks and path traversal bypasses", () => {
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("\\evil.com")).toBe("/dashboard");
  });

  it("blocks paths containing newline or carriage return injections", () => {
    expect(sanitizeRedirectPath("/dashboard\r\nSet-Cookie:bad=1")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/dashboard\nLocation:http://evil.com")).toBe("/dashboard");
  });
});
