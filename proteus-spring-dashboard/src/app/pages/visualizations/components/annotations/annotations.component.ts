import { Component, OnInit } from '@angular/core';
import { Annotation, AnnotationTypes } from './annotation';
import { AnnotationsService } from './annotations.service'

@Component({
  selector: 'app-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss']
})
export class AnnotationsComponent implements OnInit {
 
  selectedAnnotation: Annotation;
  newAnnotation: Annotation;
  annotations: Annotation[];

  constructor(private annotationsService: AnnotationsService) { }

  ngOnInit(): void {
    this.getAnnotations();
  }

  getAnnotations(): void {
    this.annotationsService.getAnnotations()
      .then(annotations => this.annotations = annotations);
  }

  add(annotation: Annotation): void {
    this.annotationsService.create(annotation);
    this.newAnnotation = null;
  }

  delete(annotation: Annotation): void {
    this.annotationsService.delete(annotation.id);
  }

  edit(annotation: Annotation): void {
    this.selectedAnnotation = annotation;
  }

  save(annotation: Annotation): void {
    this.selectedAnnotation = null;
  }

  showCreateForm() {
    this.newAnnotation = new Annotation();
  }

}
