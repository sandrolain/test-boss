import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestlistsChecksComponent } from './testlists-checks.component';

describe('TestlistsChecksComponent', () => {
  let component: TestlistsChecksComponent;
  let fixture: ComponentFixture<TestlistsChecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestlistsChecksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestlistsChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
