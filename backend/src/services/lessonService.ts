import { Course } from "../models/Course";
import { Lesson } from "../models/Lesson"
import { courseRepository } from "../repositories/courseRepository";
import { lessonRepository } from "../repositories/lessonRepository"
import { User } from "../models/User";

export class LessonService{

    async createlesson(
        lessonData: {
            title: string;
            videoUrl: string;
            content?: string;
            duration: number;
            courseId: number;
        },
        user: User
    ){
        const course = await courseRepository.findOne({
            where:{id:lessonData.courseId},
            relations:["creator"],
        });
        if (!course) throw new Error("Course not found");
        if (user.role !== "admin" && course.creator.id !== user.id) {
            throw new Error("You can only add lessons to courses you own");
        }
        const lesson = lessonRepository.create({
            title: lessonData.title,
            videoUrl: lessonData.videoUrl,
            content: lessonData.content,
            duration: lessonData.duration,
            course,
        });
        return lessonRepository.save(lesson);
    }

    async getLessonById(id:number){
        const lesson= await lessonRepository.findOne({where:{id}})
        if(!lesson) throw new Error("Lesson not found!")
        return lesson
    }

    async getLessonsByCourseId(courseId: number) {
        const lessons = await lessonRepository.find({ where: { course: { id: courseId } },relations: ['course'],});
        return lessons;
      }
      

    async updateLesson(
        id: number,
        data: Pick<Partial<Lesson>, "title" | "videoUrl" | "content" | "duration">
    ) {
        const lesson = await lessonRepository.findOne({ where: { id }, relations: ["course"] });
        if (!lesson) throw new Error("Lesson not found!");
        if (data.title !== undefined) lesson.title = data.title;
        if (data.videoUrl !== undefined) lesson.videoUrl = data.videoUrl;
        if (data.content !== undefined) lesson.content = data.content;
        if (data.duration !== undefined) lesson.duration = data.duration;
        return lessonRepository.save(lesson);
    }
    

    async deleteLesson(id:number){
        await lessonRepository.update(id,{deleted:true})
    }


    async getAllLessons(user: User) {
        const query = lessonRepository
            .createQueryBuilder("lesson")
            .leftJoinAndSelect("lesson.course", "course")
            .leftJoinAndSelect("course.creator", "creator")
            .where("lesson.deleted = false");
        if (user.role !== "admin") {
            query.andWhere("creator.id = :userId", { userId: user.id });
        }
        return query.orderBy("lesson.id", "DESC").getMany();
    }

}