import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestreportsEditComponent } from './testreports-edit.component';

describe('TestreportsEditComponent', () => {
  let component: TestreportsEditComponent;
  let fixture: ComponentFixture<TestreportsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestreportsEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestreportsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
