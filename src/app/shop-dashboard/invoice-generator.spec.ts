import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceGeneratorComponent } from './invoice-generator';
import { AuthService } from '../auth.service';

describe('InvoiceGeneratorComponent', () => {
  let component: InvoiceGeneratorComponent;
  let fixture: ComponentFixture<InvoiceGeneratorComponent>;
  let authServiceMock: { user$: { subscribe: (fn: (user: unknown) => void) => void } };

  beforeEach(async () => {
    authServiceMock = {
      user$: { subscribe: (fn: (user: unknown) => void) => { fn(null); } }
    };

    await TestBed.configureTestingModule({
      imports: [InvoiceGeneratorComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
