import { RequestHandler } from "express";

type FieldType = "string" | "email" | "number" | "integer" | "boolean" | "array" | "object";

interface FieldRule {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: readonly (string | number)[];
}

export function validateIdParam(name = "id"): RequestHandler {
  return (req, res, next) => {
    const value = Number(req.params[name]);
    if (!Number.isSafeInteger(value) || value <= 0) {
      res.status(400).json({
        status: "error",
        message: `${name} must be a positive integer`,
      });
      return;
    }
    next();
  };
}

export function validateBody(
  rules: Record<string, FieldRule>
): RequestHandler {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      res.status(400).json({ status: "error", message: "Request body must be an object" });
      return;
    }

    const errors: string[] = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      if (value === undefined || value === null || value === "") {
        if (rule.required) errors.push(`${field} is required`);
        continue;
      }

      if (rule.type === "string") {
        if (
          typeof value !== "string" ||
          !value.trim() ||
          (rule.minLength !== undefined && value.trim().length < rule.minLength) ||
          (rule.maxLength !== undefined && value.length > rule.maxLength)
        ) {
          errors.push(`${field} must be non-empty text`);
          continue;
        }
      } else if (rule.type === "email") {
        if (
          typeof value !== "string" ||
          value.length > (rule.maxLength ?? 254) ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          errors.push(`${field} must be a valid email address`);
          continue;
        }
      } else if (rule.type === "number" || rule.type === "integer") {
        const parsed = typeof value === "number" ? value : Number(value);
        if (
          (typeof value !== "number" && typeof value !== "string") ||
          String(value).trim() === "" ||
          !Number.isFinite(parsed) ||
          (rule.type === "integer" && !Number.isSafeInteger(parsed)) ||
          (rule.min !== undefined && parsed < rule.min) ||
          (rule.max !== undefined && parsed > rule.max)
        ) {
          errors.push(`${field} must be a valid ${rule.type}`);
          continue;
        }
        req.body[field] = parsed;
      } else if (rule.type === "boolean") {
        if (value === "true") req.body[field] = true;
        else if (value === "false") req.body[field] = false;
        else if (typeof value !== "boolean") errors.push(`${field} must be true or false`);
      } else if (rule.type === "array") {
        if (!Array.isArray(value)) errors.push(`${field} must be an array`);
      } else if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`${field} must be an object`);
      }

      if (
        rule.enum &&
        !rule.enum.includes(req.body[field] as string | number)
      ) {
        errors.push(`${field} has an unsupported value`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        status: "error",
        message: "Request validation failed",
        errors,
      });
      return;
    }
    next();
  };
}
