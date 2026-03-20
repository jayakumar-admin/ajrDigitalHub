import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Preview } from './preview';
import { ThemeService } from '../theme.service';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('Preview', () => {
  let component: Preview;
  let fixture: ComponentFixture<Preview>;
  let themeServiceMock: {
    getThemeById: jasmine.Spy;
  };

  beforeEach(async () => {
    themeServiceMock = {
      getThemeById: jasmine.createSpy('getThemeById').and.returnValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [Preview],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: themeServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Preview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
