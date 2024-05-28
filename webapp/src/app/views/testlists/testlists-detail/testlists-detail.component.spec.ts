import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestlistsDetailComponent } from './testlists-detail.component';

describe('TestlistsDetailComponent', () => {
  let component: TestlistsDetailComponent;
  let fixture: ComponentFixture<TestlistsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestlistsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestlistsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
