import { Request, Response } from "express";
import { LessonService } from "../services/lessonService";
import { AuthRequest } from "../types/authRequest";
import { env } from "../config/env";

const lessonService = new LessonService();

export class LessonController {
  async createLesson(req: Request, res: Response) {
    const user = (req as AuthRequest).user;
    const { title, content, duration } = req.body;
    const videoUrl = req.file
      ? `${env.publicApiUrl}/uploads/${req.file.filename}`
      : req.body.videoUrl;
    const courseId = Number(req.body.courseId);
    const parsedDuration = Number(duration);
    if (!user || typeof title !== "string" || !title.trim() ||
        !Number.isInteger(courseId) || courseId <= 0 ||
        !Number.isFinite(parsedDuration) || parsedDuration < 0) {
      res.status(400).json({ message: "Valid title, course ID, and duration are required" });
      return;
    }

    try {
      const lesson = await lessonService.createlesson({
        title: title.trim(),
        videoUrl,
        content,
        duration: parsedDuration,
        courseId,
      }, user);
      res
        .status(201)
        .json({ message: "lesson created successfully!", data: lesson });
    } catch (error) {
      const message = (error as Error).message;
      res.status(message === "Course not found" ? 404 : message.includes("own") ? 403 : 500).json({ message });
    }
  }

  async getLessonById(req: Request, res: Response) {
    const lessonId = Number(req.params.id);
    try {
      const lesson = await lessonService.getLessonById(lessonId);
      res.status(200).json({ data: lesson });
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getLessonByCourseId(req: Request, res: Response) {
    const courseId = Number(req.params.id);
    try {
      const lesson = await lessonService.getLessonsByCourseId(courseId);
      res.status(200).json({ data: lesson });
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async updateLesson(req: Request, res: Response) {
    const lessonId = Number(req.params.id);
    const { title, content, duration } = req.body;
    const videoUrl = req.file
      ? `${env.publicApiUrl}/uploads/${req.file.filename}`
      : req.body.videoUrl;
    const data: {
      title?: string;
      videoUrl?: string;
      content?: string;
      duration?: number;
    } = {};
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ message: "Lesson title must not be empty" });
        return;
      }
      data.title = title.trim();
    }
    if (videoUrl !== undefined) data.videoUrl = videoUrl;
    if (content !== undefined) data.content = content;
    if (duration !== undefined) {
      const parsedDuration = Number(duration);
      if (!Number.isFinite(parsedDuration) || parsedDuration < 0) {
        res.status(400).json({ message: "Lesson duration must be a non-negative number" });
        return;
      }
      data.duration = parsedDuration;
    }

    try {
      const updatedLesson = await lessonService.updateLesson(lessonId, data);
      res
        .status(200)
        .json({ message: "Lesson updated successfully", data: updatedLesson });
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async deleteLesson(req: Request, res: Response) {
    const lessonId = Number(req.params.id);
    try {
      await lessonService.deleteLesson(lessonId);
      res.status(200).json({ message: "Lesson deleted successfully!" });
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getAllLesson(req: Request, res: Response) {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: "Authentication is required" });
      return;
    }
    try {
      const lessons = await lessonService.getAllLessons(user);
      res.status(200).json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Error fetching lessons" });
    }
  }
}
