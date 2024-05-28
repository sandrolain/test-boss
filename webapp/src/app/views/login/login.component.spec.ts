import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../services/auth/auth.service';
import { mockAuthService } from '../../testutils/AuthService.mock';
import { fillInputValue } from '../../testutils/form';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const authService = mockAuthService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).not.toBeNull();
    expect(
      compiled.querySelector('input[formControlName="email"]')
    ).not.toBeNull();
    expect(
      compiled.querySelector('input[formControlName="password"]')
    ).not.toBeNull();
  });

  it('should check email errors', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector<HTMLInputElement>(
      'input[formControlName="email"]'
    )!;
    fillInputValue(emailInput, 'foo');
    fixture.detectChanges();
    expect(compiled.querySelector('mat-error')).not.toBeNull();
    expect(compiled.querySelector('mat-error')?.textContent).toContain(
      'Please enter a valid email address'
    );
    fillInputValue(emailInput, 'john.doe@test.com');
    fixture.detectChanges();
    expect(compiled.querySelector('mat-error')).toBeNull();
  });

  it('should check password errors', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pwdInput = compiled.querySelector<HTMLInputElement>(
      'input[formControlName="password"]'
    )!;
    fillInputValue(pwdInput, 'foo');
    fixture.detectChanges();
    expect(compiled.querySelector('mat-error')).not.toBeNull();
    expect(compiled.querySelector('mat-error')?.textContent).toContain(
      'Password is required and must be valid'
    );
    fillInputValue(pwdInput, 'Foo.bar123');
    fixture.detectChanges();
    expect(compiled.querySelector('mat-error')).toBeNull();
  });

  it('should login', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector<HTMLInputElement>(
      'input[formControlName="email"]'
    )!;
    const pwdInput = compiled.querySelector<HTMLInputElement>(
      'input[formControlName="password"]'
    )!;
    fillInputValue(emailInput, 'john.doe@test.com');
    fillInputValue(pwdInput, 'Foo.bar123');
    fixture.detectChanges();
    expect(compiled.querySelector('mat-error')).toBeNull();

    const loginButton = compiled.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    )!;
    loginButton.click();
    fixture.detectChanges();
  });
});
