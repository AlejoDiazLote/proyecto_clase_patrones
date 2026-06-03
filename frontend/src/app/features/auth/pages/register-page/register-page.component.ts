import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(100)]],
        correo: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(100),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatch },
    );
  }

  get nombre() {
    return this.form.get('nombre')!;
  }
  get correo() {
    return this.form.get('correo')!;
  }
  get password() {
    return this.form.get('password')!;
  }
  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { nombre, correo, password } = this.form.value;
    this.authService.register({ nombre, correo, password }).subscribe({
      next: () => {
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message;
        if (Array.isArray(msg)) {
          this.errorMessage = msg[0];
        } else if (typeof msg === 'string') {
          this.errorMessage = msg;
        } else if (err.status === 409) {
          this.errorMessage = 'Ya existe una cuenta con este correo.';
        } else {
          this.errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';
        }
      },
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
