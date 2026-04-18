import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CardModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    this.registerForm.markAllAsTouched();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registerForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.authService
      .register({
        email: this.registerForm.controls.email.value ?? '',
        username: this.registerForm.controls.username.value ?? '',
        firstName: this.registerForm.controls.firstName.value ?? '',
        lastName: this.registerForm.controls.lastName.value ?? '',
        password: this.registerForm.controls.password.value ?? '',
        role: 'admin'
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.registerForm.reset();
          this.successMessage.set('Account created successfully. You can log in now.');
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage.set(error.error?.message ?? 'Registration failed. Please try again.');
        }
      });
  }
}
