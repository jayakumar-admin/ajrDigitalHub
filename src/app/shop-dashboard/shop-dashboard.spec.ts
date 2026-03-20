import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopDashboardComponent } from './shop-dashboard';
import { AuthService } from '../auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('ShopDashboardComponent', () => {
  let component: ShopDashboardComponent;
  let fixture: ComponentFixture<ShopDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: () => signal({ email: 'test@example.com' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
