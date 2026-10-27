import { Router } from "express";
import { CourseQuestionController } from "../controllers/courseQuestionController";
import { authenticateUser } from "../middleware/middleware";
import { validateBody, validateIdParam } from "../middleware/requestValidation";
import { courseQuestionRateLimit } from "../middleware/rateLimits";

const router = Router();
const courseQuestionController = new CourseQuestionController();

router.param("courseId", validateIdParam("courseId"));
router.post(
  "/courses/:courseId/questions",
  authenticateUser,
  courseQuestionRateLimit,
  validateBody({ question: { type: "string", required: true, maxLength: 1000 } }),
  courseQuestionController.askQuestion
);

export { router as aiRoutes };
