import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerInformation } from './seller-information';
describe('SellerInformation', () => {
  let fixture: ComponentFixture<SellerInformation>;
  beforeEach(async () => {
    fixture = TestBed.createComponent(SellerInformation);
    fixture.componentRef.setInput('seller', LDF_PROJECTS_SELLER);
    await fixture.whenStable();
  });

  it('renders available values once and omits missing optional data', () => {
    const values = [...fixture.nativeElement.querySelectorAll('dd')].map((x) => x.textContent);
    expect(values).toEqual([
      LDF_PROJECTS_SELLER.name,
      LDF_PROJECTS_SELLER.information.supplierType,
      LDF_PROJECTS_SELLER.sector,
      '12',
      'Lima',
      'San Miguel',
    ]);
    expect(fixture.nativeElement.querySelectorAll('dt')).toHaveLength(6);
    expect(fixture.nativeElement.textContent).not.toContain('R.U.C.');
  });
  it('renders supplied optional fields including zero without changing the original seller', async () => {
    fixture.componentRef.setInput('seller', {
      ...LDF_PROJECTS_SELLER,
      information: {
        ...LDF_PROJECTS_SELLER.information,
        taxId: 'TEST-ID',
        foundedOn: '2020-01-01',
        employeeCount: 0,
        businessHours: ['Development hours'],
      },
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('dt')).toHaveLength(10);
    for (const value of ['TEST-ID', '2020-01-01', '0', 'Development hours'])
      expect([...fixture.nativeElement.querySelectorAll('dd')].map((x) => x.textContent)).toContain(
        value,
      );
    expect(LDF_PROJECTS_SELLER.information.taxId).toBeUndefined();
  });
});
