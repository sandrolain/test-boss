import { WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth/auth.service';
import { mockAuthService } from './testutils/AuthService.mock';

const mockActivatedRoute = {
  snapshot: { data: {} },
} as ActivatedRoute;

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  const authService = mockAuthService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'webapp' title`, () => {
    expect(component.title).toEqual('Test Boss');
  });

  it('should render loader', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-loader-overlay')).not.toBeNull();
    expect(compiled.querySelector('mat-toolbar')).toBeNull();
    expect(compiled.querySelector('mat-sidenav-container')).toBeNull();
  });

  it('should render app on ready', async () => {
    fixture.componentInstance.ready = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar')).not.toBeNull();
    expect(compiled.querySelector('mat-sidenav-container')).not.toBeNull();
    expect(compiled.querySelector('app-loader-overlay')).toBeNull();
  });

  it('should render app on ready', async () => {
    (authService.loggedIn as WritableSignal<boolean>).set(true);
    TestBed.flushEffects();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('mat-card');
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain('John Doe');
  });
});
