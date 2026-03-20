import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Admin } from './admin';
import { ThemeService, Theme } from '../theme.service';
import { AuthService } from '../auth.service';
import { signal } from '@angular/core';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;
  let themeServiceMock: {
    themes: () => Theme[];
    orders: () => unknown[];
    deleteTheme: jasmine.Spy;
    deleteOrder: jasmine.Spy;
  };
  let authServiceMock: {
    user: () => { email: string } | null;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    themeServiceMock = {
      themes: signal([]),
      orders: signal([]),
      deleteTheme: jasmine.createSpy('deleteTheme').and.returnValue(Promise.resolve()),
      deleteOrder: jasmine.createSpy('deleteOrder').and.returnValue(Promise.resolve())
    };
    authServiceMock = {
      user: signal({ email: 'test@example.com' }),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
