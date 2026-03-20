import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopSettingsComponent } from './shop-settings';

describe('ShopSettingsComponent', () => {
  let component: ShopSettingsComponent;
  let fixture: ComponentFixture<ShopSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopSettingsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
