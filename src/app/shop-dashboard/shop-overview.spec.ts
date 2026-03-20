import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopOverviewComponent } from './shop-overview';
import { provideRouter } from '@angular/router';

describe('ShopOverviewComponent', () => {
  let component: ShopOverviewComponent;
  let fixture: ComponentFixture<ShopOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopOverviewComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
