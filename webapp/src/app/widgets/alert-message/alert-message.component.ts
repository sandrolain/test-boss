import { Component } from '@angular/core';

@Component({
  selector: 'app-alert-message',
  standalone: true,
  imports: [],
  template: `<div class="message"><ng-content></ng-content></div>`,
  styles: `
    .message {
      padding: 16px;
      color: var(--app-alert-text-color);
      border: 1px solid var(--mat-divider-color);
      margin: 16px;
      font-weight: bold;
      text-align: center;
    }
  `,
})
export class AlertMessageComponent {}
