import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { ThemeService } from '../theme.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let themeServiceMock: { getThemes: () => unknown };

  beforeEach(async () => {
    themeServiceMock = {
      getThemes: () => signal([])
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
