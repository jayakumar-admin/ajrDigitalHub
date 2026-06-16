import { Component, signal, computed, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
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

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  overlayGradient: string;
  animationType: 'fade' | 'slide' | 'zoom';
  isActive: boolean;
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
export class HomeComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  isMessageSent = signal(false);
  testimonials = signal<TestimonialType[]>([]);
  isChatOpen = signal(false);
  landingConfig = signal<LandingConfigType | null>(null);
  duplicatedTestimonials = signal<TestimonialType[]>([]);
  
  // Hero slider banner state
  slides = signal<HeroSlide[]>([]);
  currentSlideIndex = signal<number>(0);
  private autoPlayTimer: any = null;

  activeSlide = computed(() => {
    const list = this.slides();
    const idx = this.currentSlideIndex();
    if (list.length > 0 && idx >= 0 && idx < list.length) {
      return list[idx];
    }
    return null;
  });

  // 24 hours from now for the demo
  offerEndTime = signal(Date.now() + 24 * 60 * 60 * 1000);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.apiService.getLandingConfig().subscribe({
      next: (config) => this.landingConfig.set(config),
      error: (err) => console.error('Landing config error:', err)
    });

    this.loadTestimonials();
    this.loadSliderBanners();
  }

  ngOnDestroy() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  private loadSliderBanners() {
    this.apiService.get('/settings/hero-slider').subscribe({
      next: (res: any) => {
        const rawSlides = res?.slides || res?.data?.slides || [];
        // Filter to keep active slides only
        const activeOnly = rawSlides.filter((s: any) => s.isActive === true);
        this.slides.set(activeOnly);

        if (activeOnly.length > 1) {
          this.startAutoPlay();
        }
      },
      error: (err) => console.error('Slider load error:', err)
    });
  }

  private startAutoPlay() {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
    
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, 7000); // Transitions automatically after 7 seconds
  }

  nextSlide() {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentSlideIndex.set((this.currentSlideIndex() + 1) % total);
  }

  prevSlide() {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentSlideIndex.set((this.currentSlideIndex() - 1 + total) % total);
  }

  setSlide(index: number) {
    this.currentSlideIndex.set(index);
    // Restart autoplay clock on custom input
    this.startAutoPlay();
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
