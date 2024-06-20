import { Component, Inject, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { QuillModule } from 'ngx-quill';
import { NotificationService } from '../../../services/notification/notification.service';
import {
  TestreportDto,
  TestreportEditDto,
} from '../../../services/testreports/testreports.model';
import { TestreportsService } from '../../../services/testreports/testreports.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-testreports-edit',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    QuillModule,
  ],
  template: `
    <h1 mat-dialog-title>{{ pageTitle }} {{ title }}</h1>
    <div mat-dialog-content>
      <div class="crud-form">
        <form [formGroup]="testreportForm">
          <mat-form-field>
            <mat-label i18n>Name</mat-label>
            <input matInput formControlName="name" />
            @if(testreportForm.get('name')?.hasError('required')) {
            <mat-error i18n>Name is required</mat-error>}
          </mat-form-field>
          <mat-label i18n>Description</mat-label>
          <quill-editor formControlName="description"></quill-editor>
          <mat-label i18n>Execution</mat-label>
          <quill-editor formControlName="execution"></quill-editor>
        </form>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-raised-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="confirm()">
        Confirm
      </button>
    </div>
  `,
  styles: ``,
})
export class TestreportsEditComponent {
  private testreportsService = inject(TestreportsService);
  private notificationService = inject(NotificationService);

  testreportForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', []),
    execution: new FormControl('', []),
  });

  testreportId?: string;
  testreport?: TestreportDto;
  pageTitle = $localize`Create Testreport`;
  title = '';

  constructor(
    public dialogRef: MatDialogRef<TestreportsEditComponent>,
    @Inject(MAT_DIALOG_DATA) public params: TestreportEditParams
  ) {
    this.testreportId = this.params?._id;
  }

  ngOnInit() {
    if (this.testreportId) {
      this.pageTitle = $localize`Edit Testreport: `;
      this.testreportsService
        .getTestreport(this.testreportId)
        .then((testreport) => {
          this.title = `${testreport.name}`;
          this.testreport = testreport;
          this.testreportForm.patchValue(testreport);
        })
        .catch((err) => {
          console.error(err);
          this.notificationService.error($localize`Failed to load testreport`);
        });
    } else {
      this.testreport = this.params;
      this.testreportForm.patchValue(this.testreport);
    }
  }

  confirm() {
    if (this.testreportForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }

    const data = this.testreportForm.value as TestreportEditDto;
    console.log('🚀 ~ TestreportsEditComponent ~ confirm ~ data:', data);
    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close();
  }
}

export type TestreportEditParams = TestreportDto;
