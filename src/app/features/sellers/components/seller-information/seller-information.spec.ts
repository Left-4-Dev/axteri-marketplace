import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerInformation } from './seller-information';

describe('SellerInformation', () => {
  let fixture: ComponentFixture<SellerInformation>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SellerInformation);
    fixture.componentRef.setInput('seller', LDF_PROJECTS_SELLER);
    await fixture.whenStable();
  });

  it('renders available values once including RUC, Importador, fecha, personal y horario', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('R.U.C.');
    expect(text).toContain('20516921529');
    expect(text).toContain('Importador');
    expect(text).toContain('01 - 07 - 2014');
    expect(text).toContain('6');
    expect(text).toContain('12 años');
    expect(text).toContain('Lunes a viernes: 9:00 a. m. - 7:00 p. m.');
    expect(text).toContain('Sábados: 9:00 a. m. - 1:00 p. m.');
    expect(fixture.nativeElement.querySelectorAll('dt')).toHaveLength(10);
    expect(fixture.nativeElement.querySelectorAll('dd')).toHaveLength(10);
  });

  it('renders years derived from seller.years and renders service hours as separate lines', () => {
    fixture.componentRef.setInput('seller', {
      ...LDF_PROJECTS_SELLER,
      years: 15,
      information: {
        ...LDF_PROJECTS_SELLER.information,
        businessHours: ['Turno mañana', 'Turno tarde'],
      },
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('15 años');
    expect(text).toContain('Turno mañana');
    expect(text).toContain('Turno tarde');

    const dds = Array.from(fixture.nativeElement.querySelectorAll('dd')) as HTMLElement[];
    const hoursDd = dds.find((dd) => dd.textContent?.includes('Turno mañana'));
    expect(hoursDd?.querySelectorAll('div')).toHaveLength(2);
  });

  it('omits optional fields properly when missing without altering other fields', async () => {
    fixture.componentRef.setInput('seller', {
      ...LDF_PROJECTS_SELLER,
      information: {
        supplierType: 'Mayorista',
        businessHours: [],
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('R.U.C.');
    expect(text).not.toContain('Fecha de fundación');
    expect(text).not.toContain('N° de personal');
    expect(text).not.toContain('Horario de servicio');
    expect(text).toContain('Mayorista');
    expect(text).toContain('12 años');
    expect(fixture.nativeElement.querySelectorAll('dt')).toHaveLength(6);
    expect(fixture.nativeElement.querySelectorAll('dd')).toHaveLength(6);
  });
});
