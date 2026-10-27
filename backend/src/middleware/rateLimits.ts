import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many login attempts. Please try again later." },
});

export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many registration attempts. Please try again later." },
});

export const courseQuestionRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many AI questions. Please try again later.",
  },
});
