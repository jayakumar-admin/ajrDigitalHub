import { ChangeDetectionStrategy, Component, inject, signal, AfterViewInit, ElementRef, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../theme.service';
import { animate, inView } from 'motion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit {
  themeService = inject(ThemeService);
  el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  pageVisits = signal(12450); // Mocked page visits

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Simulate some visits incrementing
      setInterval(() => {
        this.pageVisits.update(v => v + Math.floor(Math.random() * 5));
      }, 5000);
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Animate service cards when they come into view
    inView('.grid > div', (element) => {
      animate(
        element,
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.8, ease: "easeOut" }
      );
    });

    // Animate featured themes
    inView('.grid.md\\:grid-cols-3 > div', (element) => {
      animate(
        element,
        { opacity: [0, 1], scale: [0.95, 1] },
        { duration: 0.6, ease: "easeOut" }
      );
    });
  }

  services = [
    {
      title: 'Web Development',
      icon: 'code',
      description: 'Custom websites built with modern frameworks for speed and scalability.'
    },
    {
      title: 'E-Commerce Solutions',
      icon: 'shopping_cart',
      description: 'Robust online stores with secure payment gateways and inventory management.'
    },
    {
      title: 'Mobile App Development',
      icon: 'smartphone',
      description: 'Native and cross-platform mobile apps to engage your customers on the go.'
    },
    {
      title: 'Digital Marketing',
      icon: 'trending_up',
      description: 'SEO, SEM, and social media strategies to grow your online presence.'
    },
    {
      title: 'UI/UX Design',
      icon: 'brush',
      description: 'User-centric designs that provide intuitive and engaging experiences.'
    },
    {
      title: 'Cloud Solutions',
      icon: 'cloud',
      description: 'Scalable cloud infrastructure and hosting for your digital assets.'
    }
  ];

  reasons = [
    {
      title: 'Fast Delivery',
      description: 'We deliver high-quality websites in record time.'
    },
    {
      title: 'Affordable Pricing',
      description: 'Premium solutions that fit your budget.'
    },
    {
      title: 'Expert Support',
      description: 'Our team is always here to help you with any issues.'
    },
    {
      title: 'Modern Tech Stack',
      description: 'We use the latest technologies for better performance.'
    }
  ];

  pricingPlans = [
    {
      name: 'Starter',
      price: '4,999',
      description: 'Perfect for small businesses and personal portfolios.',
      features: [
        'Single Page Website',
        'Responsive Design',
        'Basic SEO Setup',
        '1 Month Support',
        'Free .IN Domain'
      ],
      popular: false
    },
    {
      name: 'Business',
      price: '14,999',
      description: 'Ideal for growing businesses needing more features.',
      features: [
        'Up to 5 Pages',
        'Custom UI/UX Design',
        'Advanced SEO',
        '3 Months Support',
        'Free .COM Domain',
        'Contact Form Integration'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '29,999',
      description: 'Full-scale solutions for large organizations.',
      features: [
        'Unlimited Pages',
        'E-commerce Integration',
        'Priority Support',
        'Custom Backend API',
        'Performance Optimization',
        'Security Hardening'
      ],
      popular: false
    }
  ];

  testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Founder, TechStart',
      content: 'AJR Digital HUB transformed our online presence. Their themes are top-notch and the support is exceptional.',
      avatar: 'https://picsum.photos/seed/person1/100/100'
    },
    {
      name: 'Priya Patel',
      role: 'Marketing Director, Bloom',
      content: 'The AI generator saved us weeks of work. We got a professional landing page in minutes. Highly recommended!',
      avatar: 'https://picsum.photos/seed/person2/100/100'
    },
    {
      name: 'Amit Kumar',
      role: 'Owner, FreshBites',
      content: 'Affordable and reliable. They understood our business needs perfectly and delivered a beautiful website.',
      avatar: 'https://picsum.photos/seed/person3/100/100'
    }
  ];
}
