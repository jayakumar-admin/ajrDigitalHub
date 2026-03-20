import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceLandingComponent } from './invoice-landing.ts';
import { AuthService } from '../auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('InvoiceLandingComponent', () => {
  let component: InvoiceLandingComponent;
  let fixture: ComponentFixture<InvoiceLandingComponent>;
  let authServiceMock: { user: () => unknown; login: jasmine.Spy };

  beforeEach(async () => {
    authServiceMock = {
      user: signal(null),
      login: jasmine.createSpy('login')
    };

    await TestBed.configureTestingModule({
      imports: [InvoiceLandingComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
