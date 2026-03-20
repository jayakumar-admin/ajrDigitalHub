import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';
import { DarkModeService } from '../dark-mode.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let cartServiceMock: { totalCount: () => number };
  let authServiceMock: { isAdmin: () => boolean; user: () => unknown };
  let darkModeServiceMock: { darkMode: () => boolean; toggle: () => void };

  beforeEach(async () => {
    cartServiceMock = {
      totalCount: signal(0)
    };
    authServiceMock = {
      isAdmin: signal(false),
      user: signal(null)
    };
    darkModeServiceMock = {
      darkMode: signal(false),
      toggle: () => { /* toggle logic */ }
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
