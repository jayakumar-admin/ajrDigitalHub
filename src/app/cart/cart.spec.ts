import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cart } from './cart';
import { CartService, CartItem } from '../cart.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartServiceMock: {
    cartItems: () => CartItem[];
    totalPrice: () => number;
    removeFromCart: jasmine.Spy;
    submitOrder: jasmine.Spy;
  };

  beforeEach(async () => {
    cartServiceMock = {
      cartItems: signal([]),
      totalPrice: signal(0),
      removeFromCart: jasmine.createSpy('removeFromCart'),
      submitOrder: jasmine.createSpy('submitOrder').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
