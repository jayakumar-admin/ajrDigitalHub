import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html'
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  loading = signal(false);
  errorMsg = signal('');

  login(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login({ email: this.username(), password: this.password() }).subscribe({
      next: (res: any) => {
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        this.errorMsg.set(err.error?.error || 'Invalid credentials');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
