import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiResponse, Course, CourseCatalogResponse, CourseQuestionAnswer, Lesson, Review } from '../models/model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CourseService {

  constructor(private http:HttpClient) { }

  private readonly api= environment.apiUrl

  //Courses
  getCourseById(id: number): Observable<ApiResponse<Course>>{
    return this.http.get<ApiResponse<Course>>(`${this.api}/course/${id}`);
  }
  
  // getCourses(query:string=''){
  //   const url= query? `${this.api}/search?search=${encodeURIComponent(query)}`: `${this.api}/course/`
  //   return this.http.get(url);
  // }

  getCourses(search = '', page = 1, limit = 20): Observable<CourseCatalogResponse>{
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('limit', limit);
    return this.http.get<CourseCatalogResponse>(`${this.api}/course/`, { params })
  }

  getManageCourses(): Observable<Course[]>{
    return this.http.get<Course[]>(`${this.api}/course/manage`)
  }

  getManageCourseById(id: number): Observable<ApiResponse<Course>>{
    return this.http.get<ApiResponse<Course>>(`${this.api}/course/manage/${id}`)
  }


  //Course managment by teacher/admin
  addCourse(course:FormData): Observable<ApiResponse<Course>>{
    return this.http.post<ApiResponse<Course>>(`${this.api}/course/`, course)
  }

  updateCourse(id:number,course:FormData): Observable<ApiResponse<Course>>{
    return this.http.put<ApiResponse<Course>>(`${this.api}/course/${id}`, course)
  }


  deleteCourse(id:number): Observable<void>{
    return this.http.delete<void>(`${this.api}/course/delete/${id}`)
  }



  //Lessons
  getLessonById(id: number): Observable<ApiResponse<Lesson>> {
    return this.http.get<ApiResponse<Lesson>>(`${this.api}/lesson/${id}`);
  }

  getLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.api}/lesson/`)
  }

  addLesson(lesson: FormData): Observable<ApiResponse<Lesson>> {
    return this.http.post<ApiResponse<Lesson>>(`${this.api}/lesson/`, lesson)
  }

  updateLesson(
    id: number,
    lesson: FormData
  ): Observable<ApiResponse<Lesson>> {
    return this.http.put<ApiResponse<Lesson>>(`${this.api}/lesson/${id}`, lesson)
  }

  deleteLesson(id:number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.api}/lesson/${id}`)
  }

  getLessonByCourseId(courseId:number): Observable<ApiResponse<Lesson[]>> {
    return this.http.get<ApiResponse<Lesson[]>>(`${this.api}/lesson/course/${courseId}`)
  }

  askCourseQuestion(courseId: number, question: string): Observable<CourseQuestionAnswer> {
    return this.http.post<CourseQuestionAnswer>(`${this.api}/ai/courses/${courseId}/questions`, {
      question,
    });
  }



  getReviewsByCourseId(courseId:number): Observable<ApiResponse<Review[]>>{
    return this.http.get<ApiResponse<Review[]>>(`${this.api}/review/course/${courseId}`)
  }

  
  // private reviewsSubject = new BehaviorSubject<any[]>([]);
  // reviews$ = this.reviewsSubject.asObservable();

  // reviews: any[] = [];
  // getReviewsByCourseId(courseId: number) {
  //   return this.http
  //     .get(`${this.api}/review/course/${courseId}`)
  //     .subscribe((res: any) => {
  //       this.reviews = res.data.filter((review: any) => !review.deleted);
  //       this.reviewsSubject.next(this.reviews);
  //       console.log(this.reviews);
  //     });
  //   // return this.reviews$;
  // }

  getDiscussionByCourseId(courseId:number){
    return this.http.get(`${this.api}/comment/course/${courseId}`)
  }



  //Search
  private searchQuery=new BehaviorSubject<string>('');
  query$ = this.searchQuery.asObservable();

  emitSearch(query:string){
    this.searchQuery.next(query)
  }

}
