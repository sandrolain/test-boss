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
  TestlistDto,
  TestlistEditDto,
} from '../../../services/testlists/testlists.model';
import { TestlistsService } from '../../../services/testlists/testlists.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-testlists-edit',
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
        <form [formGroup]="testlistForm">
          <mat-form-field>
            <mat-label i18n>Name</mat-label>
            <input matInput formControlName="name" />
            @if(testlistForm.get('name')?.hasError('required')) {
            <mat-error i18n>Name is required</mat-error>}
          </mat-form-field>
          <div class="form-field">
            <mat-label i18n>Description</mat-label>
            <quill-editor formControlName="description"></quill-editor>
          </div>
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
export class TestlistsEditComponent {
  private testlistsService = inject(TestlistsService);
  private notificationService = inject(NotificationService);

  testlistForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', []),
  });

  testlistId?: string;
  testlist?: TestlistDto;
  pageTitle = $localize`Create Testlist`;
  title = '';

  constructor(
    public dialogRef: MatDialogRef<TestlistsEditComponent>,
    @Inject(MAT_DIALOG_DATA) public params: TestlistEditParams
  ) {
    this.testlistId = this.params?._id;
  }

  ngOnInit() {
    if (this.testlistId) {
      this.pageTitle = $localize`Edit Testlist: `;
      this.testlistsService
        .getTestlist(this.testlistId)
        .then((testlist) => {
          this.title = `${testlist.name}`;
          this.testlist = testlist;
          this.testlistForm.patchValue(testlist);
        })
        .catch((err) => {
          this.notificationService.error($localize`Failed to load testlist`);
        });
    }
  }

  confirm() {
    if (this.testlistForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }

    const data = this.testlistForm.value as TestlistEditDto;
    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close();
  }
}

export type TestlistEditParams = TestlistDto;
