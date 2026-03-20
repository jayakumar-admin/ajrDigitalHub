import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  auth = inject(AuthService);
  router = inject(Router);

  async login() {
    try {
      await this.auth.login();
      // The guard or a separate effect will handle redirection if admin
      // But for now, let's just wait and check
      setTimeout(() => {
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else if (this.auth.user()) {
          alert('Access Denied: You do not have administrator privileges.');
          this.auth.logout();
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
