import { formatDate } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

type DetailsBoxValue = string | number | Date | undefined | null;

export interface DetailsBoxField {
  label: string;
  value: DetailsBoxValue;
  html?: boolean;
}

@Component({
  selector: 'app-details-box',
  standalone: true,
  imports: [MatExpansionModule],
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>{{ title }}</mat-panel-title>
      </mat-expansion-panel-header>
      <div class="profile">
        <div class="profile-details">
          @for (field of fields; track field) {
          <div class="profile-field">
            <label>{{ field.label }}</label>
            @if(field.html) {
            <div [innerHTML]="formatValue(field.value)"></div>
            } @else {
            <div>{{ formatValue(field.value) }}</div>
            }
          </div>
          }
        </div>
      </div>
    </mat-expansion-panel>
  `,
  styles: ``,
})
export class DetailsBoxComponent {
  @Input() title = $localize`Details`;
  @Input() fields: DetailsBoxField[] = [];

  constructor(@Inject(LOCALE_ID) private localeId: string) {}

  formatValue(value: DetailsBoxValue): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    if (value instanceof Date) {
      return formatDate(value, 'medium', this.localeId);
    }
    return value.toString();
  }
}
