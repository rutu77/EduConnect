import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { Course, Enrollment, Lesson, Quiz, Review } from '../../models/model';
import { AuthService } from '../../services/auth.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { CourseService } from '../../services/course.service';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-coursedetails',
  standalone: false,
  templateUrl: './coursedetails.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './coursedetails.component.css',
})
export class CoursedetailsComponent implements OnInit, OnDestroy {
  course: Course | undefined;
  get userId(): number | null { return this.session.getUserId(); }
  enrollments: Enrollment[] = [];
  lessons: Lesson[] = [];
  reviews: Review[] = [];
  quizzes: Quiz[] = [];
  isTeacher = false;
  isAdmin = false;
  isLoggedIn = false;
  isLoadingCourse = true;
  isLoadingEnrollments = false;
  isLoadingLessons = false;
  isLoadingQuizzes = false;
  isLoadingReviews = true;
  courseError = '';
  lessonsError = '';
  quizzesError = '';
  reviewsError = '';
  aiQuestion = '';
  aiAnswer = '';
  aiError = '';
  aiSources: Array<{ lessonId: number; title: string }> = [];
  isAskingAI = false;
  displayUpdateReviewDialog = false;
  displayAddReviewDialog = false;
  showEnrollDialog = false;
  courseId!: number;
  selectedCourseId!: number;
  selectedReview!: Review;
  selectedCourse!: Course;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public courseService: CourseService,
    private homeService: HomeService,
    private router: Router,
    private auth: AuthService,
    private session: AuthSessionService,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.auth.$role.pipe(takeUntil(this.destroy$)).subscribe((role) => {
      this.isTeacher = role === 'teacher';
      this.isAdmin = role === 'admin';
      this.changeDetector.markForCheck();
    });
    this.auth.$authState.pipe(takeUntil(this.destroy$)).subscribe((loggedIn) => {
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = loggedIn;
      if (!loggedIn) {
        this.enrollments = [];
        this.isLoadingEnrollments = false;
      } else if (!wasLoggedIn && this.courseId > 0) {
        this.loadEnrollments();
      }
      this.changeDetector.markForCheck();
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.courseError = 'This course could not be found.';
      this.isLoadingCourse = false;
      this.isLoadingReviews = false;
      this.changeDetector.markForCheck();
      return;
    }
    this.courseId = id;
    this.selectedCourseId = id;
    this.loadCourseById(id);
    this.loadReviewsByCourseId(id);
    this.loadEnrollments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourseById(courseId: number): void {
    this.isLoadingCourse = true;
    this.courseError = '';
    this.courseService.getCourseById(courseId).subscribe({
      next: (response) => {
        this.course = response.data;
        this.isLoadingCourse = false;
        this.changeDetector.markForCheck();
      },
      error: (error: any) => {
        console.error('Unable to load course details:', error);
        this.course = undefined;
        this.courseError = error.error?.message || 'Course details could not be loaded. Please try again.';
        this.isLoadingCourse = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  loadCourseContent(courseId: number): void {
    this.loadLessonsByCourseId(courseId);
    this.loadQuizzes(courseId);
  }

  loadLessonsByCourseId(courseId: number): void {
    this.isLoadingLessons = true;
    this.lessonsError = '';
    this.courseService.getLessonByCourseId(courseId).subscribe({
      next: (response) => {
        this.lessons = response.data.filter((lesson) => !lesson.deleted);
        this.isLoadingLessons = false;
        this.changeDetector.markForCheck();
      },
      error: (error: any) => {
        console.error('Unable to load course lessons:', error);
        this.lessons = [];
        if (error.status === 404) {
          this.lessonsError = '';
        } else {
          this.lessonsError = 'Lessons could not be loaded. Please try again.';
        }
        this.isLoadingLessons = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  loadQuizzes(courseId: number): void {
    this.isLoadingQuizzes = true;
    this.quizzesError = '';
    this.homeService.getQuizByCourse(courseId).subscribe({
      next: (data) => {
        this.quizzes = data.filter((quiz) => !quiz.deleted);
        this.isLoadingQuizzes = false;
        this.changeDetector.markForCheck();
      },
      error: (error: any) => {
        console.error('Unable to load course quizzes:', error);
        this.quizzes = [];
        this.quizzesError = error.error?.message || 'Quizzes could not be loaded. Please try again.';
        this.isLoadingQuizzes = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  viewLesson(lessonId: number): void {
    void this.router.navigate(['/course/lesson', lessonId]);
  }

  takeQuiz(quizId: number): void {
    void this.router.navigate(['/quiz/takeQuiz', quizId]);
  }

  askCourseQuestion(): void {
    const question = this.aiQuestion.trim();
    if (!question || this.isAskingAI) return;

    this.isAskingAI = true;
    this.aiAnswer = '';
    this.aiError = '';
    this.aiSources = [];
    this.courseService.askCourseQuestion(this.courseId, question).subscribe({
      next: (response) => {
        this.aiAnswer = response.answer;
        this.aiSources = response.sources;
        this.isAskingAI = false;
        this.changeDetector.markForCheck();
      },
      error: (error: any) => {
        console.error('Unable to answer course question:', error);
        this.aiError = error.error?.message || 'The AI tutor could not answer right now. Please try again.';
        this.isAskingAI = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  loadEnrollments(): void {
    if (!this.isLoggedIn) {
      this.enrollments = [];
      this.isLoadingEnrollments = false;
      return;
    }

    this.isLoadingEnrollments = true;
    this.homeService.getEnrollments().subscribe({
      next: (data) => {
        this.enrollments = data.filter((enrollment) => !enrollment.deleted);
        this.isLoadingEnrollments = false;
        if (this.isEnrolled(this.courseId)) this.loadCourseContent(this.courseId);
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Unable to load enrollments for course:', error);
        this.enrollments = [];
        this.isLoadingEnrollments = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  isEnrolled(courseId: number): boolean {
    const userId = this.userId;
    return userId !== null && this.enrollments.some(
      (enrollment) => enrollment.user.id === userId && enrollment.course.id === courseId
    );
  }

  openEnrollmentDialog(course: Course): void {
    this.selectedCourse = course;
    this.showEnrollDialog = true;
  }

  closeEnrollmentDialog(): void {
    this.showEnrollDialog = false;
  }

  refreshEnrollments(): void {
    this.showEnrollDialog = false;
    this.loadEnrollments();
  }

  enroll(): void {
    void this.router.navigate(['auth/login']);
  }

  loadReviewsByCourseId(courseId: number): void {
    this.isLoadingReviews = true;
    this.reviewsError = '';
    this.courseService.getReviewsByCourseId(courseId).subscribe({
      next: (response) => {
        this.reviews = response.data.filter((review) => !review.deleted);
        this.isLoadingReviews = false;
        this.changeDetector.markForCheck();
      },
      error: (error: any) => {
        console.error('Unable to load course reviews:', error);
        this.reviews = [];
        this.reviewsError = error.error?.message || 'Reviews could not be loaded. Please try again.';
        this.isLoadingReviews = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  isReviewUserSame(reviewUserId: number): boolean {
    return this.userId !== null && this.userId === reviewUserId;
  }

  updateReviewDialog(review: Review): void {
    this.selectedReview = review;
    this.displayUpdateReviewDialog = true;
  }

  refreshReviews(): void {
    this.loadReviewsByCourseId(this.courseId);
    this.displayUpdateReviewDialog = false;
    this.displayAddReviewDialog = false;
  }

  addReviewDialog(): void {
    this.displayAddReviewDialog = true;
  }

  deleteReview(reviewId: number): void {
    this.homeService.deleteReview(reviewId).subscribe({
      next: () => {
        this.loadReviewsByCourseId(this.courseId);
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Review deleted successfully!' });
      },
      error: (error: any) => {
        console.error('Error deleting review:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Failed to delete review!'
        });
      }
    });
  }
}
