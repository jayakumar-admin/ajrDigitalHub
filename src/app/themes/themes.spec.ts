import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Themes } from './themes';
import { ThemeService } from '../theme.service';
import { CartService } from '../cart.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('Themes', () => {
  let component: Themes;
  let fixture: ComponentFixture<Themes>;
  let themeServiceMock: { getThemes: () => unknown };
  let cartServiceMock: { addToCart: jasmine.Spy };

  beforeEach(async () => {
    themeServiceMock = {
      getThemes: () => signal([])
    };
    cartServiceMock = {
      addToCart: jasmine.createSpy('addToCart')
    };

    await TestBed.configureTestingModule({
      imports: [Themes],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Themes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
