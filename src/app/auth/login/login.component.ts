import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  fillDemo() {
    this.loginForm.patchValue({ email: 'demo@icoach.app', password: 'demo1234' });
  }

  submit(): void {
    this.loginForm.markAllAsTouched();
    this.errorMessage.set('');

    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.authService
      .login({
        email: this.loginForm.controls.email.value ?? '',
        password: this.loginForm.controls.password.value ?? '',
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/admin/dashboard'),
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage.set(error.error?.message ?? 'Login failed. Please try again.');
        },
      });
  }
}
