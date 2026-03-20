import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopCustomersComponent } from './shop-customers';

describe('ShopCustomersComponent', () => {
  let component: ShopCustomersComponent;
  let fixture: ComponentFixture<ShopCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopCustomersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
