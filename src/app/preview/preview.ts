import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { ThemeService } from '../theme.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe],
  templateUrl: './preview.html',
  styleUrl: './preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preview {
  route = inject(ActivatedRoute);
  themeService = inject(ThemeService);
  sanitizer = inject(DomSanitizer);
  
  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  theme = computed(() => {
    const currentId = this.id();
    return currentId ? this.themeService.getThemeById(currentId) : undefined;
  });
  
  viewMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  showCode = signal(false);

  safePreviewUrl = computed(() => {
    const url = this.theme()?.previewUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : undefined;
  });
}
