import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestreportsDetailComponent } from './testreports-detail.component';

describe('TestreportsDetailComponent', () => {
  let component: TestreportsDetailComponent;
  let fixture: ComponentFixture<TestreportsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestreportsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestreportsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
