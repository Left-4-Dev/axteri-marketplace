import { CatalogRepository } from './catalog.repository';

describe('CatalogRepository', () => {
  const catalog = new CatalogRepository();
  it('preserves unique product, seller, brand, category, offer and SKU identities', () => {
    for (const group of [catalog.products(), catalog.sellers, catalog.categories, catalog.brands]) {
      expect(new Set(group.map((x) => x.id)).size).toBe(group.length);
    }
    expect(catalog.categories).toHaveLength(9);
    expect(catalog.sellers).toHaveLength(5);
    expect(catalog.offers).toHaveLength(5);
    expect(new Set(catalog.offers.map((o) => o.productId)).size).toBe(catalog.offers.length);
    const skus = catalog.products().flatMap((p) => (p.sku ? [p.sku] : []));
    expect(new Set(skus).size).toBe(skus.length);
  });
  it('resolves every commercial reference and validates each price', () => {
    for (const p of catalog.products()) {
      expect(catalog.getSeller(p.sellerId)).toBeDefined();
      expect(catalog.getBrand(p.brandId)).toBeDefined();
      expect(catalog.getCategory(p.categoryId)).toBeDefined();
      const price = p.price;
      if (price.kind === 'fixed') {
        expect(price.amount).toBeGreaterThan(0);
        if (price.previousAmount !== undefined)
          expect(price.previousAmount).toBeGreaterThan(price.amount);
      }
      if (price.kind === 'range') {
        expect(price.min).toBeGreaterThan(0);
        expect(price.max).toBeGreaterThanOrEqual(price.min);
      }
    }
    for (const id of [
      ...catalog.offers.map((o) => o.productId),
      ...catalog.collections.featured,
      ...catalog.collections.recommended,
      ...catalog.collections.w22Accessories,
    ])
      expect(catalog.getProduct(id)).toBeDefined();
    for (const id of [...catalog.collections.menuBrands, ...catalog.collections.ldfBrands])
      expect(catalog.getBrand(id)).toBeDefined();
    for (const id of catalog.collections.homeCategories)
      expect(catalog.getCategory(id)).toBeDefined();
  });
  it('combines seller, category, brand, origin, rating and normalized search', () => {
    expect(
      catalog
        .listProducts({
          proveedor: 'ldf-projects',
          categoria: 'electrical-materials',
          marca: 'weg',
          q: ' TRIFASICO ',
          origin: 'Brasil',
          minRating: 4,
        })
        .map((p) => p.id),
    ).toEqual(['weg-w22-3kw']);
    expect(catalog.listProducts({ proveedor: 'missing' })).toEqual([]);
  });
});
