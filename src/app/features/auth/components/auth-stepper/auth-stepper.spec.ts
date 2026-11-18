import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthStepper } from './auth-stepper';

describe('AuthStepper', () => {
  let fixture: ComponentFixture<AuthStepper>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthStepper);
    element = fixture.nativeElement;
  });

  it('renders the four provider registration steps with their expected labels', () => {
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();

    const items = Array.from(element.querySelectorAll<HTMLLIElement>('.auth-stepper__item'));
    expect(items).toHaveLength(4);
    expect(
      items.map((item) => item.querySelector('.auth-stepper__caption')?.textContent?.trim()),
    ).toEqual(['Paso 1', 'Paso 2', 'Paso 3', 'Paso 4']);
    expect(
      items.map((item) => item.querySelector('.auth-stepper__label')?.textContent?.trim()),
    ).toEqual(['CONTACTO', 'DATOS', 'CATEGORÍA', '¡LISTO!']);
  });

  it('computes completed, active, and upcoming states accurately as steps advance', () => {
    fixture.componentRef.setInput('currentStep', 3);
    fixture.detectChanges();

    const items = Array.from(element.querySelectorAll<HTMLLIElement>('.auth-stepper__item'));
    expect(items.map((item) => item.getAttribute('data-status'))).toEqual([
      'completed',
      'completed',
      'active',
      'upcoming',
    ]);
    expect(items[2].getAttribute('aria-current')).toBe('step');
    expect(items[0].getAttribute('aria-current')).toBeNull();
  });
});
