import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestreportsResultsComponent } from './testreports-results.component';

describe('TestreportsResultsComponent', () => {
  let component: TestreportsResultsComponent;
  let fixture: ComponentFixture<TestreportsResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestreportsResultsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestreportsResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
