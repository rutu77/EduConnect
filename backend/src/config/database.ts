import { DataSource } from "typeorm";
import { env } from "./env";
import { InitialPostgresSchema1791417600000 } from "../migrations/1791417600000-InitialPostgresSchema";
import { RenameLegacyPostgresTables1791417601000 } from "../migrations/1791417601000-RenameLegacyPostgresTables";
import { AddTeacherRequestStatus1791417602000 } from "../migrations/1791417602000-AddTeacherRequestStatus";
import { AddLessonContent1791417603000 } from "../migrations/1791417603000-AddLessonContent";
import {User} from "../models/User"
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Lesson } from "../models/Lesson";
import { Quiz } from "../models/Quiz";
import { Review } from "../models/Review";
import { Comment } from "../models/Comment";
import { Progress } from "../models/Progress";
import { Question } from "../models/Question";


export const AppDataSource= new DataSource({
    type:"postgres",
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    host: env.database.host,
    database: env.database.name,
    entities:[User,Course,Enrollment, Lesson, Quiz, Review, Question, Comment, Progress],
    synchronize: false,
    migrations: [
      InitialPostgresSchema1791417600000,
      RenameLegacyPostgresTables1791417601000,
      AddTeacherRequestStatus1791417602000,
      AddLessonContent1791417603000,
    ],
})
