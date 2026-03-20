import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiGenerator } from './ai-generator';
import { AiService } from '../ai.service';
import { ThemeService } from '../theme.service';
import { provideRouter } from '@angular/router';

describe('AiGenerator', () => {
  let component: AiGenerator;
  let fixture: ComponentFixture<AiGenerator>;
  let aiServiceMock: {
    suggestThemes: jasmine.Spy;
  };
  let themeServiceMock: {
    getThemeById: jasmine.Spy;
  };

  beforeEach(async () => {
    aiServiceMock = {
      suggestThemes: jasmine.createSpy('suggestThemes').and.returnValue(Promise.resolve({ suggestions: [] }))
    };
    themeServiceMock = {
      getThemeById: jasmine.createSpy('getThemeById').and.returnValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [AiGenerator],
      providers: [
        provideRouter([]),
        { provide: AiService, useValue: aiServiceMock },
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AiGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
