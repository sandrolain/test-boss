import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestresultsEditComponent } from './testresults-edit.component';

describe('TestresultsEditComponent', () => {
  let component: TestresultsEditComponent;
  let fixture: ComponentFixture<TestresultsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestresultsEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestresultsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
