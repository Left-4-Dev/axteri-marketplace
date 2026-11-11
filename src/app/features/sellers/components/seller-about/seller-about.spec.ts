import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LDF_PROJECTS_SELLER } from '../../data/seller-profile.data';
import { SellerAbout } from './seller-about';
describe('SellerAbout', () => {
  let fixture: ComponentFixture<SellerAbout>;
  beforeEach(async () => {
    fixture = TestBed.createComponent(SellerAbout);
    fixture.componentRef.setInput('seller', LDF_PROJECTS_SELLER);
    await fixture.whenStable();
  });

  it('renders paragraphs and gallery from the input and hides failed images', async () => {
    const paragraphs = [...fixture.nativeElement.querySelectorAll('p')];
    expect(paragraphs.map((p) => p.textContent)).toEqual(LDF_PROJECTS_SELLER.description);
    const images: HTMLImageElement[] = Array.from(fixture.nativeElement.querySelectorAll('img'));
    expect(images.map((i) => i.getAttribute('src'))).toEqual(LDF_PROJECTS_SELLER.gallery);
    images[0].dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(images[0].style.visibility).toBe('hidden');
    expect(fixture.nativeElement.querySelector('.seller-about__fallback')).not.toBeNull();
    images[0].dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(images[0].style.visibility).toBe('visible');
  });
});
