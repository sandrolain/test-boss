import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestlistsEditComponent } from './testlists-edit.component';

describe('TestlistsEditComponent', () => {
  let component: TestlistsEditComponent;
  let fixture: ComponentFixture<TestlistsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestlistsEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestlistsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
