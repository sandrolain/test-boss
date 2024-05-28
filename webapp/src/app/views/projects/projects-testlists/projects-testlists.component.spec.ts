import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsTestlistsComponent } from './projects-testlists.component';

describe('ProjectsTestlistsComponent', () => {
  let component: ProjectsTestlistsComponent;
  let fixture: ComponentFixture<ProjectsTestlistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsTestlistsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectsTestlistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
