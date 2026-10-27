import { Router } from "express"
import { LessonController } from "../controllers/lessonController"
import {
  authenticateUser,
  authorizeCourseOwnerOrAdminFromBody,
  authorizeLessonOwnerOrAdmin,
  authorizeRole,
} from "../middleware/middleware"
import { validateBody, validateIdParam } from "../middleware/requestValidation"
import { videoUpload } from "../middleware/videoUpload"


const lessonController= new LessonController()

const router= Router()
router.param("id", validateIdParam());

router.post('/',authenticateUser,videoUpload.single("video"),validateBody({
  courseId: { type: "integer", required: true, min: 1 },
  title: { type: "string", required: true },
  videoUrl: { type: "string" },
  content: { type: "string", maxLength: 50000 },
  duration: { type: "number", required: true, min: 0 },
}),authorizeCourseOwnerOrAdminFromBody,lessonController.createLesson)
router.get('/:id',authenticateUser,lessonController.getLessonById)
router.get('/',authenticateUser,authorizeRole(["admin", "teacher"]),lessonController.getAllLesson)
router.put('/:id',authenticateUser,authorizeLessonOwnerOrAdmin,videoUpload.single("video"),validateBody({
  title: { type: "string" },
  videoUrl: { type: "string" },
  content: { type: "string", maxLength: 50000 },
  duration: { type: "number", min: 0 },
}),lessonController.updateLesson)
router.get('/course/:id',authenticateUser,lessonController.getLessonByCourseId)
router.delete('/:id',authenticateUser,authorizeLessonOwnerOrAdmin,lessonController.deleteLesson)



export {router as lessonRoutes}