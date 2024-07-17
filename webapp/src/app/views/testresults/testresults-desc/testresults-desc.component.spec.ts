import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestresultsDescComponent } from './testresults-desc.component';

describe('TestresultsDescComponent', () => {
  let component: TestresultsDescComponent;
  let fixture: ComponentFixture<TestresultsDescComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestresultsDescComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestresultsDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
