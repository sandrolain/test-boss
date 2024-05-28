import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

export const SNACK_ERROR_CONFIG: MatSnackBarConfig = {
  panelClass: 'error-snackbar',
  duration: environment.SNACK_ERROR_DURATION,
};

export const SNACK_WARN_CONFIG: MatSnackBarConfig = {
  panelClass: 'warn-snackbar',
  duration: environment.SNACK_ERROR_DURATION,
};

export const SNACK_CONFIRM_CONFIG: MatSnackBarConfig = {
  panelClass: 'confirm-snackbar',
  duration: environment.SNACK_CONFIRM_DURATION,
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  confirm(message: string) {
    this.snackBar.open(message, $localize`Close`, SNACK_CONFIRM_CONFIG);
  }

  warn(message: string) {
    this.snackBar.open(message, $localize`Close`, SNACK_WARN_CONFIG);
  }

  error(message: string) {
    this.snackBar.open(message, $localize`Close`, SNACK_ERROR_CONFIG);
  }
}
