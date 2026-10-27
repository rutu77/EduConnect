import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updatelesson',
  standalone: false,
  templateUrl: './updatelesson.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './updatelesson.component.css'
})

export class UpdatelessonComponent implements OnInit{

  @Input() lessonId!: number ;
  @Output() lessonUpdated= new EventEmitter<void>();
  @Output() cancel= new EventEmitter<void>();

  
  updateLessonForm!: FormGroup;
  isSaving = false;
  isLoadingLesson = false;
  selectedVideo: File | null = null;

  constructor(private _course:CourseService){}

  ngOnInit(): void {

    this.updateLessonForm= new FormGroup({
      title: new FormControl('', [Validators.required]),
      videoUrl: new FormControl(''),
      content: new FormControl(''),
      duration: new FormControl(0, [Validators.required, Validators.min(0)]),
    })

  }

  ngOnChanges(){
    this.loadlessonData()
  }

  loadlessonData(){
    if(this.lessonId){
      this.isLoadingLesson = true;
      this._course.getLessonById(this.lessonId).subscribe({
        next: (response) => {
          this.updateLessonForm.patchValue({
            title: response.data.title,
            videoUrl: response.data.videoUrl,
            content: response.data.content ?? '',
            duration: response.data.duration ?? 0,
          });
          this.isLoadingLesson = false;
        },
        error: (error: any) => {
          console.error('Error loading lesson:', error);
          this.isLoadingLesson = false;
          Swal.fire({
            icon: 'error',
            title: 'Unable to load lesson',
            text: error.error?.message || 'Please try again.',
          });
        }
        });
    }
  }

  onSubmit(){
    if (this.updateLessonForm.invalid || this.isSaving || this.isLoadingLesson) {
      this.updateLessonForm.markAllAsTouched();
      return;
    }
    const values = this.updateLessonForm.getRawValue();
    const title = String(values.title ?? '').trim();
    if (!title) {
      this.updateLessonForm.controls['title'].setErrors({ required: true });
      return;
    }

    this.isSaving = true;
    const lessonData = new FormData();
    lessonData.append('title', title);
    lessonData.append('videoUrl', String(values.videoUrl ?? '').trim());
    lessonData.append('content', String(values.content ?? ''));
    lessonData.append('duration', String(Number(values.duration)));
    if (this.selectedVideo) {
      lessonData.append('video', this.selectedVideo);
    }

    this._course.updateLesson(this.lessonId, lessonData).subscribe({
      next: () => {
        Swal.fire({
          title: 'Lesson Updated',
          text: 'The lesson has been updated successfully!',
          icon: 'success',
        });
        this.lessonUpdated.emit();
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('Error updating lesson:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Failed to update the lesson.'
        });
        this.isSaving = false;
      }
    });
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedVideo = input.files?.[0] ?? null;
  }

}
