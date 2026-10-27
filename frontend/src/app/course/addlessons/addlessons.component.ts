import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Course } from '../../models/model';

@Component({
  selector: 'app-addlessons',
  standalone: false,
  templateUrl: './addlessons.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './addlessons.component.css'
})

export class AddlessonsComponent implements OnInit {

  constructor(
    private _course: CourseService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  @Output() lessonAdded= new EventEmitter<void>();

  lessonForm!: FormGroup;
  courses: Course[] = [];
  isLoadingCourses = true;
  courseLoadError: string | null = null;
  isSaving = false;
  selectedVideo: File | null = null;


  ngOnInit(): void {
    this.lessonForm= new FormGroup({
      title: new FormControl('', [Validators.required]),
      videoUrl: new FormControl(''),
      content: new FormControl(''),
      duration: new FormControl(0, [Validators.required, Validators.min(0)]),
      courseId: new FormControl<number | null>(null, [Validators.required]),
    });
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.courseLoadError = null;
    this._course.getManageCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoadingCourses = false;
        this.changeDetector.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error loading courses for lesson creation:', error);
        this.courseLoadError = 'Courses could not be loaded. Please try again.';
        this.isLoadingCourses = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  onSubmit(){
    if (this.lessonForm.invalid || this.isSaving) {
      this.lessonForm.markAllAsTouched();
      return;
    }
    const formValue = this.lessonForm.getRawValue();
    const title = String(formValue.title).trim();
    if (!title) {
      this.lessonForm.controls['title'].setErrors({ required: true });
      return;
    }

    this.isSaving = true;
    const lessonData = new FormData();
    lessonData.append('title', title);
    lessonData.append('videoUrl', String(formValue.videoUrl ?? '').trim());
    lessonData.append('content', String(formValue.content ?? ''));
    lessonData.append('duration', String(Number(formValue.duration)));
    lessonData.append('courseId', String(Number(formValue.courseId)));
    if (this.selectedVideo) {
      lessonData.append('video', this.selectedVideo);
    }

    this._course.addLesson(lessonData).subscribe({
        next: () => {
          Swal.fire({
            title: 'Lesson Added',
            text: 'The lesson has been added successfully!',
            icon: 'success',
          });
          this.lessonAdded.emit();
          this.lessonForm.reset({ title: '', videoUrl: '', content: '', duration: 0, courseId: null });
          this.selectedVideo = null;
          this.isSaving = false;
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          console.error("Error adding lesson", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.error?.message || "Something went wrong!",
          });
          this.isSaving = false;
          this.changeDetector.detectChanges();
        },
      });
    }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedVideo = input.files?.[0] ?? null;
  }

  }
