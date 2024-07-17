import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestresultsPassComponent } from './testresults-pass.component';

describe('TestresultsPassComponent', () => {
  let component: TestresultsPassComponent;
  let fixture: ComponentFixture<TestresultsPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestresultsPassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestresultsPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
