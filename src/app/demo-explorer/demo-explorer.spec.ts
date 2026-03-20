import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoExplorer } from './demo-explorer';
import { provideRouter } from '@angular/router';

describe('DemoExplorer', () => {
  let component: DemoExplorer;
  let fixture: ComponentFixture<DemoExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoExplorer],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoExplorer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
