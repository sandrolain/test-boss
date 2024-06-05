import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestchecksEditComponent } from './testchecks-edit.component';

describe('TestchecksEditComponent', () => {
  let component: TestchecksEditComponent;
  let fixture: ComponentFixture<TestchecksEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestchecksEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestchecksEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
