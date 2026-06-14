import {ChangeDetectionStrategy, Component, signal, ViewChild, ElementRef, AfterViewChecked, inject, OnInit, computed} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechCursor } from './shared/tech-ui';
import { ApiService } from './services/api.service';
import { AdminData } from './services/admin-data';
import { ThemeService } from './services/theme.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  time: string;
}

export interface AppMenuItem {
  id: number;
  label: string;
  icon?: string;
  link?: string;
  parent_id: number | null;
  is_active: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule, FormsModule, TechCursor],
  template: `
    <div class="min-h-screen flex flex-col font-sans text-app-text bg-app-bg selection:bg-indigo-100 selection:text-indigo-900">
      <!-- Navigation -->
      <nav class="bg-app-card/70 dark:bg-app-bg/80 backdrop-blur-xl border-b border-slate-250  shadow-sm fixed w-full z-50 top-0 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <a routerLink="/" class="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight group">
                @if (logoUrl()) {
                  <img [src]="logoUrl()" alt="Logo" class="w-8 h-8 rounded-lg object-cover" referrerpolicy="no-referrer">
                } @else {
                  <div class="w-8 h-8 rounded-lg bg-indigo-600 text-app-text flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/20">
                    <mat-icon class="text-[20px] w-[20px] h-[20px]">hub</mat-icon>
                  </div>
                }
                {{ siteName() || 'AJR DIGITAL HUB' }}
              </a>
            </div>
            
            <!-- Desktop Dynamic Menu -->
            <div class="hidden md:flex items-center space-x-6">
              <a routerLink="/" routerLinkActive="text-indigo-600 dark:text-indigo-400 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-app-muted dark:text-app-text hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-semibold">Home</a>
              
              @for (menu of parentMenus(); track menu.id) {
                @if (hasChildren(menu.id)) {
                  <div class="relative group">
                    <button class="flex items-center gap-1 text-app-muted dark:text-app-text hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-semibold h-16 focus:outline-none">
                      <span>{{ menu.label }}</span>
                      <mat-icon class="text-[16px] w-[16px] h-[16px] transition-transform group-hover:rotate-180">expand_more</mat-icon>
                    </button>
                    <!-- Mega Menu Dropdown -->
                    <div class="absolute left-1/2 -translate-x-1/2 top-14 w-80 sm:w-96 bg-app-card dark:bg-app-card rounded-2xl shadow-xl border border-app-border/80 dark:border-slate-750 p-5 transition-all duration-300 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-50">
                      <div class="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3 px-2">{{ menu.label }} Modules</div>
                      <div class="grid grid-cols-1 gap-1">
                        @for (child of getChildren(menu.id); track child.id) {
                          <a [routerLink]="child.link" class="flex items-start gap-4 p-3 rounded-xl transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-app-text dark:text-app-text hover:text-indigo-600 dark:hover:text-indigo-450">
                            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                              <mat-icon class="text-[18px] w-[18px] h-[18px] text-indigo-600 dark:text-indigo-400">{{ getMenuIcon(child.label) }}</mat-icon>
                            </div>
                            <div class="flex-grow">
                              <div class="text-sm font-medium">{{ child.label }}</div>
                              <div class="text-xs text-app-muted dark:text-app-muted mt-0.5 leading-snug font-normal">{{ getMenuDesc(child.label) }}</div>
                            </div>
                          </a>
                        }
                      </div>
                    </div>
                  </div>
                } @else {
                  <a [routerLink]="menu.link" routerLinkActive="text-indigo-600 dark:text-indigo-400 font-semibold" class="text-app-muted dark:text-app-text hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-semibold h-16 flex items-center">{{ menu.label }}</a>
                }
              }
              
              <a routerLink="/admin" routerLinkActive="text-indigo-600 dark:text-indigo-400 font-semibold" class="text-app-muted dark:text-app-text hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-semibold">Admin</a>
            </div>

            <div class="hidden md:flex items-center space-x-4">
              <!-- Global Theme Switcher -->
              <button (click)="toggleTheme()" class="w-10 h-10 rounded-full border border-app-border  flex items-center justify-center text-app-muted hover:bg-app-bg dark:hover:bg-app-card hover:text-indigo-600 transition-colors" [attr.aria-label]="isDark() ? 'Switch to light theme' : 'Switch to dark theme'">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>
              
              <a routerLink="/admin" class="bg-indigo-600 text-app-text px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 text-sm flex items-center gap-2">
                Open Admin
                <mat-icon class="text-[18px] w-[18px] h-[18px]">admin_panel_settings</mat-icon>
              </a>
            </div>

            <!-- Mobile menu button -->
            <div class="flex items-center md:hidden gap-3">
              <button (click)="toggleTheme()" class="text-app-muted w-8 h-8 flex items-center justify-center">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>
              <button (click)="toggleMobileMenu()" class="text-app-muted dark:text-app-text hover:text-app-text focus:outline-none" aria-label="Toggle mobile menu">
                <mat-icon>{{ isMobileOpen() ? 'close' : 'menu' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Drawer Menu -->
        @if (isMobileOpen()) {
          <div class="md:hidden border-t border-app-border bg-app-card/95 dark:bg-app-bg  backdrop-blur-md px-4 pt-2 pb-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-inner">
            <a routerLink="/" (click)="toggleMobileMenu()" class="block px-3 py-2 rounded-xl text-base font-semibold text-app-text dark:text-app-text hover:bg-app-bg dark:hover:bg-app-card">Home</a>
            
            @for (menu of parentMenus(); track menu.id) {
              @if (hasChildren(menu.id)) {
                <div class="space-y-1 block py-1">
                  <div class="px-3 text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mt-2">{{ menu.label }}</div>
                  @for (child of getChildren(menu.id); track child.id) {
                    <a [routerLink]="child.link" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-app-muted dark:text-slate-350 hover:bg-app-bg dark:hover:bg-app-card/50">
                      <mat-icon class="text-[16px] w-[16px] h-[16px] text-indigo-500">{{ getMenuIcon(child.label) }}</mat-icon>
                      {{ child.label }}
                    </a>
                  }
                </div>
              } @else {
                <a [routerLink]="menu.link" (click)="toggleMobileMenu()" class="block px-3 py-2 rounded-xl text-base font-semibold text-app-text dark:text-app-text hover:bg-app-bg dark:hover:bg-app-card">{{ menu.label }}</a>
              }
            }
            
            <a routerLink="/admin" (click)="toggleMobileMenu()" class="block px-3 py-2 rounded-xl text-base font-semibold text-app-text dark:text-app-text hover:bg-app-bg dark:hover:bg-app-card">Admin</a>

            <div class="pt-4 border-t border-app-border  flex items-center justify-between px-3">
              <a routerLink="/admin" (click)="toggleMobileMenu()" class="bg-indigo-600 text-app-text px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">Open Admin <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">admin_panel_settings</mat-icon></a>
            </div>
          </div>
        }
      </nav>

      <!-- Main Content -->
      <main class="flex-grow pt-16">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-app-bg text-app-text py-16 border-t border-app-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div class="col-span-1 md:col-span-1">
              <a routerLink="/" class="flex items-center gap-2 text-xl font-bold text-app-text tracking-tight mb-4">
                @if (logoUrl()) {
                  <img [src]="logoUrl()" alt="Logo" class="w-8 h-8 rounded-lg object-cover" referrerpolicy="no-referrer">
                } @else {
                  <div class="w-8 h-8 rounded-lg bg-indigo-500 text-app-text flex items-center justify-center">
                    <mat-icon class="text-[20px] w-[20px] h-[20px]">hub</mat-icon>
                  </div>
                }
                {{ siteName() || 'AJR DIGITAL HUB' }}
              </a>
              <p class="text-sm text-app-muted mb-6 leading-relaxed">Empowering creators and businesses with premium digital assets, custom web solutions, and smart invoicing.</p>
              <div class="flex space-x-4">
                <a href="#" class="w-10 h-10 rounded-full bg-app-card flex items-center justify-center text-app-muted hover:bg-indigo-600 hover:text-app-text transition-colors"><mat-icon class="text-[20px] w-[20px] h-[20px]">language</mat-icon></a>
                <a href="#" class="w-10 h-10 rounded-full bg-app-card flex items-center justify-center text-app-muted hover:bg-indigo-600 hover:text-app-text transition-colors"><mat-icon class="text-[20px] w-[20px] h-[20px]">mail</mat-icon></a>
              </div>
            </div>
            
            <div>
              <h3 class="text-sm font-semibold text-app-text tracking-wider uppercase mb-6">Product</h3>
              <ul class="space-y-3 text-sm">
                <li><a routerLink="/invoice-builder" class="text-app-muted hover:text-indigo-400 transition-colors">Invoice Builder</a></li>
                <li><a routerLink="/themes" class="text-app-muted hover:text-indigo-400 transition-colors">Invoice Themes</a></li>
                <li><a routerLink="/marketplace" class="text-app-muted hover:text-indigo-400 transition-colors">Marketplace</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-app-text tracking-wider uppercase mb-6">Services</h3>
              <ul class="space-y-3 text-sm">
                <li><a routerLink="/services" class="text-app-muted hover:text-indigo-400 transition-colors">Custom Development</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">E-commerce Solutions</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">UI/UX Design</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">Consulting</a></li>
              </ul>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-app-text tracking-wider uppercase mb-6">Company</h3>
              <ul class="space-y-3 text-sm">
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" class="text-app-muted hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div class="mt-16 pt-8 border-t border-app-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-sm text-app-muted">
              &copy; 2026 {{ siteName() || 'AJR DIGITAL HUB' }}. All rights reserved.
            </div>
            <div class="flex items-center gap-2 text-sm text-app-muted">
              <mat-icon class="text-emerald-500 text-[18px] w-[18px] h-[18px]">verified_user</mat-icon>
              Safe & Secure Payments
            </div>
          </div>
        </div>
      </footer>
      
      <!-- Live Chat Bubble & Window -->
      <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        <!-- Chat Window -->
        @if (isChatOpen()) {
          <div class="bg-app-card w-80 sm:w-96 rounded-2xl shadow-2xl border border-app-border mb-4 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right" style="height: 500px; max-height: calc(100vh - 120px);">
            <!-- Chat Header -->
            <div class="bg-indigo-600 p-4 text-app-text flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-10 h-10 bg-app-card/20 rounded-full flex items-center justify-center">
                    <mat-icon>support_agent</mat-icon>
                  </div>
                  <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
                </div>
                <div>
                  <h3 class="font-semibold text-sm">AJR Support</h3>
                  <p class="text-xs text-indigo-200">Typically replies in a few minutes</p>
                </div>
              </div>
              <button (click)="toggleChat()" class="text-indigo-200 hover:text-app-text transition-colors p-1 rounded-lg hover:bg-app-card/10" aria-label="Close chat">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">close</mat-icon>
              </button>
            </div>

            <!-- Chat Messages -->
            <div class="flex-grow p-4 overflow-y-auto bg-app-bg flex flex-col gap-4" #chatScroll>
              <div class="text-center text-xs text-app-muted my-2">Today</div>
              
              @for (msg of messages(); track $index) {
                <div class="flex flex-col max-w-[85%]" [class.self-end]="msg.isUser" [class.self-start]="!msg.isUser">
                  <div class="px-4 py-2.5 rounded-2xl text-sm shadow-sm"
                       [class.bg-indigo-600]="msg.isUser" [class.text-app-text]="msg.isUser" [class.rounded-tr-sm]="msg.isUser"
                       [class.bg-app-card]="!msg.isUser" [class.text-app-text]="!msg.isUser" [class.border]="!msg.isUser" [class.border-app-border]="!msg.isUser" [class.rounded-tl-sm]="!msg.isUser">
                    {{ msg.text }}
                  </div>
                  <span class="text-[10px] text-app-muted mt-1 px-1" [class.text-right]="msg.isUser">{{ msg.time }}</span>
                </div>
              }
              
              @if (isTyping()) {
                <div class="self-start flex flex-col max-w-[85%]">
                  <div class="px-4 py-3 rounded-2xl rounded-tl-sm bg-app-card border border-app-border shadow-sm flex items-center gap-1">
                    <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                </div>
              }
            </div>

            <!-- Chat Input -->
            <div class="p-3 bg-app-card border-t border-app-border shrink-0">
              <form (ngSubmit)="sendMessage()" class="flex items-center gap-2">
                <input 
                  type="text" 
                  [ngModel]="newMessage()"
                  (ngModelChange)="newMessage.set($event)"
                  name="message" 
                  placeholder="Type your message..." 
                  class="flex-grow bg-app-bg border-transparent focus:bg-app-card focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full px-4 py-2 text-sm transition-all"
                  autocomplete="off"
                  aria-label="Chat message input"
                >
                <button 
                  type="submit" 
                  [disabled]="!newMessage().trim()"
                  class="w-10 h-10 rounded-full bg-indigo-600 text-app-text flex items-center justify-center shrink-0 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  aria-label="Send message"
                >
                  <mat-icon class="text-[18px] w-[18px] h-[18px] ml-1">send</mat-icon>
                </button>
              </form>
            </div>
          </div>
        }

        <!-- Floating Buttons Container -->
        <div class="flex flex-col gap-4">
          <!-- WhatsApp Button -->
          <a href="https://wa.me/?text=Hello!%20I%20need%20more%20information%20about%20your%20services." aria-label="Contact us on WhatsApp" target="_blank" rel="noopener noreferrer" class="w-14 h-14 bg-[#25D366] text-app-text rounded-full shadow-2xl shadow-[#25D366]/40 flex items-center justify-center hover:scale-110 transition-transform group relative z-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
            </svg>
          </a>

          <!-- Bubble Button -->
          <button (click)="toggleChat()" class="w-14 h-14 bg-indigo-600 text-app-text rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 transition-transform group relative" aria-label="Toggle live chat">
            @if (!isChatOpen()) {
              <mat-icon class="group-hover:hidden">chat</mat-icon>
              <mat-icon class="hidden group-hover:block">support_agent</mat-icon>
              <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            } @else {
              <mat-icon>expand_more</mat-icon>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class App implements AfterViewChecked, OnInit {
  private apiService = inject(ApiService);
  private adminData = inject(AdminData);
  private themeService = inject(ThemeService);
  
  siteName = computed(() => this.adminData.websiteConfig().siteName);
  logoUrl = computed(() => this.adminData.websiteConfig().logoUrl);
  features = computed(() => this.adminData.websiteConfig().features);
  
  menuItems = signal<AppMenuItem[]>([]);
  isMobileOpen = signal(false);
  isChatOpen = signal(false);
  newMessage = signal('');
  isTyping = signal(false);
  isDark = computed(() => this.themeService.currentTheme() === 'dark' || this.themeService.currentTheme() === 'neon');
  
  parentMenus = computed(() => {
    const showMarketplace = this.features().marketplace;
    const showServices = this.features().services;
    const showAnalytics = this.features().analytics;

    return this.menuItems().filter(m => {
      if (!m.is_active) return false;
      if (m.parent_id !== null) return false;
      
      const labelLower = m.label.toLowerCase();
      if (!showMarketplace && labelLower.includes('marketplace')) return false;
      if (!showServices && labelLower.includes('services')) return false;
      if (!showAnalytics && labelLower.includes('analytics')) return false;
      
      return true;
    });
  });

  getChildren(parentId: number) {
    const showMarketplace = this.features().marketplace;
    const showServices = this.features().services;
    const showAnalytics = this.features().analytics;

    return this.menuItems().filter(m => {
      if (!m.is_active || m.parent_id !== parentId) return false;
      
      const labelLower = m.label.toLowerCase();
      if (!showMarketplace && labelLower.includes('marketplace')) return false;
      if (!showServices && (labelLower.includes('services') || labelLower.includes('creative'))) return false;
      if (!showAnalytics && labelLower.includes('analytics')) return false;
      
      return true;
    });
  }

  hasChildren(parentId: number): boolean {
    return this.getChildren(parentId).length > 0;
  }

  getMenuIcon(label: string): string {
    const map: Record<string, string> = {
      'SaaS Development': 'dns',
      'WhatsApp Automation': 'quickreply',
      'Analytics Systems': 'insights',
      'Invoice Systems': 'receipt_long',
      'Documentation': 'menu_book',
      'Tutorials': 'play_circle_outline',
      'Templates': 'view_quilt',
      'API Reference': 'code'
    };
    return map[label] || 'arrow_forward';
  }

  getMenuDesc(label: string): string {
    const map: Record<string, string> = {
      'SaaS Development': 'Deploy modern scalable client-side or full-stack integrations.',
      'WhatsApp Automation': 'Configure instant message alerts and conversational agents.',
      'Analytics Systems': 'Log metrics latency and dynamic custom KPIs in real-time.',
      'Invoice Systems': 'Deploy dynamic PDF generation templates and webhook pipelines.',
      'Documentation': 'Read professional configuration steps and service guides.',
      'Tutorials': 'Watch instructional videos on managing modular setups.',
      'Templates': 'Gain rapid layouts, layouts presets, and landing page builders.',
      'API Reference': 'Automate custom HTTP actions and secure authorization handshakes.'
    };
    return map[label] || 'Explore enterprise integrations and dynamic features.';
  }

  toggleMobileMenu() {
    this.isMobileOpen.update(v => !v);
  }
  
  messages = signal<ChatMessage[]>([]);

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  constructor() {
    // Theme initialization is fully delegated to the global ThemeService
  }

  ngOnInit() {
    this.messages.set([
      { text: `Hi there! 👋 Welcome to ${this.siteName() || 'AJR DIGITAL HUB'}. How can we help you today?`, isUser: false, time: this.getCurrentTime() }
    ]);
    this.apiService.getMenus().subscribe({
      next: (data) => {
        this.menuItems.set(data);
      },
      error: (err) => {
        console.error('Failed to load global menus:', err);
      }
    });
  }

  toggleTheme() {
    const current = this.themeService.currentTheme();
    if (current === 'light') {
      this.themeService.setTheme('dark');
    } else if (current === 'dark') {
      this.themeService.setTheme('neon');
    } else {
      this.themeService.setTheme('light');
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isChatOpen.update(v => !v);
    if (this.isChatOpen()) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    // Add user message
    this.messages.update(msgs => [...msgs, { text, isUser: true, time: this.getCurrentTime() }]);
    this.newMessage.set('');
    
    // Simulate support typing
    this.isTyping.set(true);
    
    setTimeout(() => {
      this.isTyping.set(false);
      this.messages.update(msgs => [...msgs, { 
        text: 'Thanks for reaching out! Our team will get back to you shortly. Is there anything else you need help with in the meantime?', 
        isUser: false, 
        time: this.getCurrentTime() 
      }]);
    }, 1500);
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch {
      // Ignore scroll errors
    }
  }
}
