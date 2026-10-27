import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function positiveInteger(name: string, fallback?: number): number {
  const raw = process.env[name];
  if (raw === undefined && fallback !== undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function nonNegativeInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}

const port = positiveInteger("PORT", 3000);
const corsOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:4200,http://127.0.0.1:4200"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  database: {
    host: required("DB_HOST"),
    port: positiveInteger("DB_PORT", 5432),
    username: required("DB_USER"),
    password: required("DB_PASSWORD"),
    name: required("DB_NAME"),
  },
  port,
  trustProxyHops: nonNegativeInteger("TRUST_PROXY_HOPS", 0),
  publicApiUrl: (process.env.PUBLIC_API_URL?.trim() || `http://localhost:${port}`)
    .replace(/\/+$/, ""),
  corsOrigins,
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || "",
  geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
};
