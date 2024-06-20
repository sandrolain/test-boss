import { Component, Inject, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { QuillModule } from 'ngx-quill';
import { NotificationService } from '../../../services/notification/notification.service';
import {
  TestcheckDto,
  TestcheckEditDto,
} from '../../../services/testchecks/testchecks.model';
import { TestchecksService } from '../../../services/testchecks/testchecks.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-testchecks-edit',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    QuillModule,
  ],
  template: `
    <h1 mat-dialog-title>{{ pageTitle }} {{ title }}</h1>
    <div mat-dialog-content>
      <div class="crud-form">
        <form [formGroup]="testcheckForm">
          <mat-form-field>
            <mat-label i18n>Name</mat-label>
            <input matInput formControlName="name" />
            @if(testcheckForm.get('name')?.hasError('required')) {
            <mat-error i18n>Name is required</mat-error>}
          </mat-form-field>
          <mat-form-field class="example-form-field">
            <mat-label i18n>Tags</mat-label>
            <mat-chip-grid #chipGrid aria-label="Enter tags">
              @for (tag of tags; track tag) {
              <mat-chip-row (removed)="removeTag(tag)">
                {{ tag }}
                <button matChipRemove aria-label="'remove ' + keyword">
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip-row>
              }
            </mat-chip-grid>
            <input
              placeholder="New tag..."
              [matChipInputFor]="chipGrid"
              (matChipInputTokenEnd)="addTag($event)"
            />
          </mat-form-field>
          <mat-label i18n>Description</mat-label>
          <quill-editor formControlName="description"></quill-editor>
          <mat-label i18n>Expected</mat-label>
          <quill-editor formControlName="expected"></quill-editor>
        </form>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button (click)="confirm()">Confirm</button>
    </div>
  `,
  styles: ``,
})
export class TestchecksEditComponent {
  private testchecksService = inject(TestchecksService);
  private notificationService = inject(NotificationService);

  testcheckForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', []),
    expected: new FormControl('', []), // TODO: editor?
  });

  testcheckId?: string;
  testcheck?: TestcheckDto;
  pageTitle = $localize`Create Testcheck`;
  title = '';

  tags: string[] = [];

  addTag(event: MatChipInputEvent) {
    const value = (event.value ?? '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput.clear();
  }

  removeTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  constructor(
    public dialogRef: MatDialogRef<TestchecksEditComponent>,
    @Inject(MAT_DIALOG_DATA) public params: TestcheckEditParams
  ) {
    this.testcheckId = this.params?._id;
  }

  ngOnInit() {
    if (this.testcheckId) {
      this.pageTitle = $localize`Edit Testcheck: `;
      this.testchecksService
        .getTestcheck(this.testcheckId)
        .then((testcheck) => {
          this.title = `${testcheck.name}`;
          this.testcheck = testcheck;
          this.testcheckForm.patchValue(testcheck);
          this.tags = testcheck.tags;
        })
        .catch((err) => {
          this.notificationService.error($localize`Failed to load testcheck`);
        });
    }
  }

  confirm() {
    if (this.testcheckForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }

    const data = this.testcheckForm.value as TestcheckEditDto;
    data.tags = this.tags;
    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close();
  }
}

export type TestcheckEditParams = TestcheckDto;
