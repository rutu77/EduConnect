import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './Course';
import { Progress } from './Progress';

@Entity({name:"Lesson_table"})
export class Lesson {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title:string;

    @Column({type:"text", nullable:true})
    content?:string | null;

    @Column({nullable:true})
    videoUrl:string;

    @Column({nullable:true})
    duration:number;

    @Column({default:false})
    deleted: boolean 

    @Column({default:false})
    completed:boolean //

    @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' ,eager:true})
    @JoinColumn({ name: "course_id" }) 
    course: Course;

    // @OneToMany(()=>Progress,(progress)=>progress.lesson,{ cascade: true })
    // progress:Progress[]; //
}