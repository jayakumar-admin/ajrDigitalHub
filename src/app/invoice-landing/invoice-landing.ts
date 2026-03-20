import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { animate, stagger, inView } from 'motion';

@Component({
  selector: 'app-invoice-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './invoice-landing.html',
  styleUrl: './invoice-landing.css'
})
export class InvoiceLandingComponent implements OnInit {
  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Hero Animation
    animate(
      '.hero-content',
      { opacity: [0, 1], y: [50, 0], scale: [0.9, 1] },
      { duration: 1, ease: [0.22, 1, 0.36, 1] }
    );

    // Feature Cards Animation
    inView('#features', () => {
      const cards = document.querySelectorAll('.feature-card');
      animate(
        cards,
        { opacity: [0, 1], y: [50, 0], rotate: [-2, 0], scale: [0.95, 1] },
        { delay: stagger(0.2), duration: 0.8, ease: [0.22, 1, 0.36, 1] }
      );
    });

    // Pricing Header Animation
    inView('.pricing-header', (info) => {
      animate(
        info,
        { opacity: [0, 1], y: [30, 0], scale: [0.95, 1] },
        { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
      );
    });

    // Pricing Cards Animation
    inView('#pricing', () => {
      const cards = document.querySelectorAll('.pricing-card');
      animate(
        cards,
        { opacity: [0, 1], y: [50, 0], scale: [0.9, 1] },
        { delay: stagger(0.15), duration: 0.8, ease: [0.22, 1, 0.36, 1] }
      );
    });
  }
}
