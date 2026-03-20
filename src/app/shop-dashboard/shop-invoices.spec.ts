import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopInvoicesComponent } from './shop-invoices';
import { provideRouter } from '@angular/router';

describe('ShopInvoicesComponent', () => {
  let component: ShopInvoicesComponent;
  let fixture: ComponentFixture<ShopInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopInvoicesComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
