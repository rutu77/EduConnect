import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { AppError } from "../utils/appError";
import { CourseQuestionService } from "../services/courseQuestionService";

const courseQuestionService = new CourseQuestionService();

export class CourseQuestionController {
  async askQuestion(req: Request, res: Response): Promise<void> {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: "Authentication is required" });
      return;
    }

    try {
      const result = await courseQuestionService.askQuestion(
        Number(req.params.courseId),
        req.body.question.trim(),
        user
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      console.error("Error answering course question:", error);
      res.status(500).json({ message: "Could not answer the course question" });
    }
  }
}
