import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ImageCroppedEvent,
  ImageCropperModule,
  LoadedImage,
} from 'ngx-image-cropper';

@Component({
  selector: 'app-image-crop-dialog',
  standalone: true,
  imports: [ImageCropperModule, MatDialogModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <div mat-dialog-content>
      <image-cropper
        class="cropper"
        [imageChangedEvent]="data.imageChangedEvent"
        [maintainAspectRatio]="true"
        [aspectRatio]="1 / 1"
        format="jpeg"
        output="blob"
        [resizeToWidth]="256"
        (imageCropped)="imageCropped($event)"
        (imageLoaded)="imageLoaded($event)"
        (cropperReady)="cropperReady()"
        (loadImageFailed)="loadImageFailed()"
      ></image-cropper>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-raised-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="confirm()">
        Confirm
      </button>
    </div>
  `,
  styles: `
    .cropper {
      max-width: 256px;
    }
    [mat-dialog-content] {
      width: 320px;
    }
  `,
})
export class ImageCropDialogComponent {
  croppedImage?: Blob;

  constructor(
    public dialogRef: MatDialogRef<ImageCropDialogComponent, Blob | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: ImageCropDialogData
  ) {}

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob!;
  }
  imageLoaded(image: LoadedImage) {}
  cropperReady() {}
  loadImageFailed() {}

  cancel() {
    this.dialogRef.close(undefined);
  }

  confirm() {
    this.dialogRef.close(this.croppedImage);
  }
}

export interface ImageCropDialogData {
  title: string;
  imageChangedEvent: Event;
}
