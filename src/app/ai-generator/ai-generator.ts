import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AiService } from '../ai.service';
import { ThemeService, Theme } from '../theme.service';

@Component({
  selector: 'app-ai-generator',
  standalone: true,
  imports: [RouterLink, MatIconModule, FormsModule],
  templateUrl: './ai-generator.html',
  styleUrl: './ai-generator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiGenerator {
  aiService = inject(AiService);
  themeService = inject(ThemeService);

  businessType = signal('');
  loading = signal(false);
  suggestions = signal<{themeId: string, reason: string}[]>([]);

  async generateSuggestions() {
    this.loading.set(true);
    this.suggestions.set([]);
    
    const result = await this.aiService.suggestThemes(this.businessType());
    this.suggestions.set(result.suggestions || []);
    this.loading.set(false);
  }

  getTheme(id: string): Theme | undefined {
    return this.themeService.getThemeById(id);
  }
}
