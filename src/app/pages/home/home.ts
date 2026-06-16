import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { CountdownTimerComponent } from '../../shared/countdown-timer';
import { KpiCounterComponent } from '../../shared/kpi-counter';
import { TechBackground, FloatingCard, DataFlow, GlowButton, ParallaxContainer } from '../../shared/tech-ui';
import { AnimatedCardComponent, SkeletonLoaderComponent } from '../../shared/ui-atoms';

export interface TestimonialType {
  id: number;
  name: string;
  role: string;
  rating: number;
  comment: string;
  image_url: string;
}

export interface LandingConfigType {
  heroText: string;
  buttonText: string;
  buttonLink: string;
  stats: { value: string; label: string }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, 
    MatIconModule, 
    CommonModule, 
    CountdownTimerComponent, 
    KpiCounterComponent,
    TechBackground,
    FloatingCard,
    DataFlow,
    GlowButton,
    ParallaxContainer,
    AnimatedCardComponent, 
    SkeletonLoaderComponent
  ],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  isMessageSent = signal(false);
  testimonials = signal<TestimonialType[]>([]);
  isChatOpen = signal(false);
  landingConfig = signal<LandingConfigType | null>(null);
  duplicatedTestimonials = signal<TestimonialType[]>([]);
  
  // 24 hours from now for the demo
  offerEndTime = signal(Date.now() + 24 * 60 * 60 * 1000);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.apiService.getLandingConfig().subscribe({
      next: (config) => this.landingConfig.set(config),
      error: (err) => console.error('Landing config error:', err)
    });

    this.loadTestimonials();
  }

  private loadTestimonials() {
    this.apiService.getTestimonials().subscribe({
      next: (data) => {
        const testimonials = Array.isArray(data) ? data : [];
        this.testimonials.set(testimonials);
        this.duplicatedTestimonials.set([...testimonials, ...testimonials, ...testimonials, ...testimonials]);
      },
      error: (err) => console.error('Testimonials error:', err)
    });
  }

  sendMessage() {
    this.isMessageSent.set(true);
    setTimeout(() => {
      this.isMessageSent.set(false);
    }, 3000);
  }

  toggleChat() {
    this.isChatOpen.update(v => !v);
  }
}
