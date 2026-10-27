export type UserRole = 'user' | 'admin' | 'teacher';

export interface User{
    id:number
    name:string
    email:string
    role:UserRole
    profilePicture?:string
    bio?:string
    deleted?:boolean
    teacherRequestStatus?:'none'|'pending'|'approved'|'rejected'
}

export interface UpdateUserRole {
    email: string;
    newRole: UserRole;
}

export interface Course{
    id:number
    title:string
    description:string
    isPublished:boolean
    thumbnail?:string
    price:number
    // tags?:string[],
    creator:CourseCreator | null,
    level:'beginner'|'intermediate'|'advanced',
    duration:number
    deleted:boolean
    createdAt?:string
}

export interface CourseCreator {
    id:number;
    name:string;
}

export interface ApiResponse<T> {
    data:T;
    message?:string;
}

export interface CourseCatalogResponse {
    data: Course[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AddCourse{
    title:string,
    description:string,
    isPublished:boolean,
    thumbnail:string,
    price:number,
    level:string,
    duration:number

}

export interface UpdateCourse {
    title?: string;
    description?: string;
    isPublished?: boolean;
    thumbnail?: string;
    price?: number;
    // tags?: string[];
    level?: string;
    duration?: number;
  }

  export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
  

export interface Enrollment{
    id:number,
    enrollment_date:string,
    user:User,
    course:Course
    status: "in_progress"|"completed"; 
    deleted:boolean
}

export interface ManagedEnrollment {
    id:number;
    enrollment_date:string;
    status:'in_progress'|'completed';
    deleted:boolean;
    user:{id:number; name:string} | null;
    course:{id:number; title:string} | null;
}

export interface Lesson{
    id:number
    title:string
    content?:string | null
    videoUrl:string
    duration?:number
    course:Course
    deleted:boolean
    completed:boolean
}

export interface CreateLesson {
    title: string;
    videoUrl: string;
    content?: string;
    duration: number;
    courseId: number;
}

export interface CourseQuestionAnswer {
    answer: string;
    sources: Array<{ lessonId: number; title: string }>;
}

export interface Quiz{
    id:number,
    title:string,
    course:QuizCourseSummary | null;
    questions:QuizQuestion[];
    deleted:boolean;
}

export interface QuizCourseSummary {
    id:number;
    title:string;
    creator:{id:number; name:string} | null;
}

export interface QuizQuestion {
    id:number;
    question:string;
    options:string[];
    correctAnswer?:string;
    explanation?:string | null;
    deleted:boolean;
}

export interface CreateQuiz {
    title:string;
    courseId:number;
}

export interface CreateQuizQuestion {
    question:string;
    options:string[];
    correctAnswer:string;
    explanation?:string;
}

export interface QuizSubmission {
    score:number;
    total:number;
    attempt:number;
    completion:string;
}

export interface ProgressRecord {
    id:number;
    score:number;
    total:number;
    completion:string;
    attempt:number;
    deleted:boolean;
    user:{id:number; name:string} | null;
    quiz:{id:number; title:string} | null;
}

export interface QuizProgressResponse extends ProgressRecord {
    user:{id:number; name:string};
    quiz:{id:number; title:string};
}

export interface Question{
    id?:number
    question:string,
    options:string[],
    correctAnswer:string,
    explanation?:string
    deleted:boolean
}

// export interface Category{
//     category_id:number,
//     name:string,
//     description?:true,
// }

export interface Review{
    id:number,
    user:{id:number; name:string},
    course:{id:number; title:string},
    rating:number,
    comment:string | null
    deleted:boolean
}

export interface AddReview{
    courseId:number,
    rating:number,
    comment:string
}

export interface UpdateReview{
    rating?:number,
    comment?:string
}


export interface Progress{
    id:number,
    score:number
    total:number
    completion:string
    attempt:number
    user:User
    quiz:Quiz
    lesson:Lesson
    deleted:boolean
}
