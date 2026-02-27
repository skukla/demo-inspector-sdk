import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectSource, trackQuery, trackData, wrapFetcher } from '../src/tracking.js';

describe('detectSource', () => {
  it('should return catalog for Citisignal_productDetail', () => {
    expect(detectSource('Query', { Citisignal_productDetail: {} })).toBe('catalog');
  });

  it('should return catalog for GetProductDetail query name', () => {
    expect(detectSource('GetProductDetail', {})).toBe('catalog');
  });

  it('should return catalog for Citisignal_productCards', () => {
    expect(detectSource('Query', { Citisignal_productCards: [] })).toBe('catalog');
  });

  it('should return catalog for products field', () => {
    expect(detectSource('Query', { products: [] })).toBe('catalog');
  });

  it('should return catalog for query name containing ProductCards', () => {
    expect(detectSource('GetProductCards', {})).toBe('catalog');
  });

  it('should return catalog for GetProductPageData query name', () => {
    expect(detectSource('GetProductPageData', {})).toBe('catalog');
  });

  it('should return catalog for Citisignal_productPageData', () => {
    expect(detectSource('Query', { Citisignal_productPageData: {} })).toBe('catalog');
  });

  it('should return search for Citisignal_productFacets', () => {
    expect(detectSource('Query', { Citisignal_productFacets: [] })).toBe('search');
  });

  it('should return search for facets field', () => {
    expect(detectSource('Query', { facets: [] })).toBe('search');
  });

  it('should return search for query name containing Search', () => {
    expect(detectSource('GetSearchResults', {})).toBe('search');
  });

  it('should return search for query name containing Filter', () => {
    expect(detectSource('ApplyFilter', {})).toBe('search');
  });

  it('should return search for query name containing Facet', () => {
    expect(detectSource('GetFacetValues', {})).toBe('search');
  });

  it('should return commerce for categories field', () => {
    expect(detectSource('Query', { categories: [] })).toBe('commerce');
  });

  it('should return commerce for storeConfig field', () => {
    expect(detectSource('Query', { storeConfig: {} })).toBe('commerce');
  });

  it('should return commerce for navigation field', () => {
    expect(detectSource('Query', { navigation: [] })).toBe('commerce');
  });

  it('should return commerce for breadcrumbs field', () => {
    expect(detectSource('Query', { breadcrumbs: [] })).toBe('commerce');
  });

  it('should return commerce for Navigation query name', () => {
    expect(detectSource('GetNavigation', {})).toBe('commerce');
  });

  it('should return commerce for Breadcrumb query name', () => {
    expect(detectSource('GetBreadcrumbs', {})).toBe('commerce');
  });

  it('should default to commerce for unknown data', () => {
    expect(detectSource('Unknown', { something: true })).toBe('commerce');
  });

  it('should default to commerce when data is null', () => {
    expect(detectSource('Query', null)).toBe('commerce');
  });

  it('should default to commerce when data is not an object', () => {
    expect(detectSource('Query', 'string')).toBe('commerce');
  });
});

describe('trackQuery', () => {
  beforeEach(() => {
    delete window.__demoInspectorTrackQuery;
  });

  it('should call window.__demoInspectorTrackQuery when present', () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    trackQuery({ name: 'Test', source: 'commerce', responseTime: 100 });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test', source: 'commerce', responseTime: 100 })
    );
  });

  it('should include id and timestamp fields', () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    trackQuery({ name: 'Test', source: 'commerce', responseTime: 100 });
    const call = spy.mock.calls[0][0];
    expect(typeof call.id).toBe('string');
    expect(call.id).toContain('Test-');
    expect(typeof call.timestamp).toBe('number');
  });

  it('should use provided id and timestamp when given', () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    trackQuery({ id: 'custom-id', name: 'Test', source: 'commerce', responseTime: 50, timestamp: 12345 });
    const call = spy.mock.calls[0][0];
    expect(call.id).toBe('custom-id');
    expect(call.timestamp).toBe(12345);
  });

  it('should not throw when window global is missing', () => {
    expect(() => trackQuery({ name: 'Test', source: 'commerce', responseTime: 100 })).not.toThrow();
  });

  it('should not throw when window global is not a function', () => {
    window.__demoInspectorTrackQuery = 'not-a-function';
    expect(() => trackQuery({ name: 'Test', source: 'commerce', responseTime: 100 })).not.toThrow();
  });
});

describe('trackData', () => {
  beforeEach(() => {
    delete window.__demoInspectorStoreData;
  });

  it('should call window.__demoInspectorStoreData when present', () => {
    const spy = vi.fn();
    window.__demoInspectorStoreData = spy;
    const data = { products: [{ id: '1' }] };
    trackData({ queryName: 'GetProducts', source: 'catalog', data });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryName: 'GetProducts', source: 'catalog', data })
    );
  });

  it('should include a timestamp', () => {
    const spy = vi.fn();
    window.__demoInspectorStoreData = spy;
    trackData({ queryName: 'Test', source: 'commerce', data: {} });
    expect(typeof spy.mock.calls[0][0].timestamp).toBe('number');
  });

  it('should use provided timestamp when given', () => {
    const spy = vi.fn();
    window.__demoInspectorStoreData = spy;
    trackData({ queryName: 'Test', source: 'commerce', data: {}, timestamp: 99999 });
    expect(spy.mock.calls[0][0].timestamp).toBe(99999);
  });

  it('should not throw when window global is missing', () => {
    expect(() => trackData({ queryName: 'Test', source: 'commerce', data: {} })).not.toThrow();
  });

  it('should not throw when window global is not a function', () => {
    window.__demoInspectorStoreData = 42;
    expect(() => trackData({ queryName: 'Test', source: 'commerce', data: {} })).not.toThrow();
  });
});

describe('wrapFetcher', () => {
  beforeEach(() => {
    delete window.__demoInspectorTrackQuery;
    delete window.__demoInspectorStoreData;
  });

  it('should return the original fetcher result', async () => {
    const fetcher = vi.fn().mockResolvedValue({ products: [] });
    const wrapped = wrapFetcher(fetcher);
    const result = await wrapped('query GetProducts { products { id } }', {});
    expect(result).toEqual({ products: [] });
  });

  it('should pass arguments through to the base fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValue({});
    const wrapped = wrapFetcher(fetcher);
    const vars = { id: '1' };
    const opts = { headers: {} };
    await wrapped('query Test { test }', vars, opts);
    expect(fetcher).toHaveBeenCalledWith('query Test { test }', vars, opts);
  });

  it('should dispatch to trackQuery with name and id', async () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    const fetcher = vi.fn().mockResolvedValue({ products: [] });
    const wrapped = wrapFetcher(fetcher);
    await wrapped('query GetProducts { products { id } }', {});
    const call = spy.mock.calls[0][0];
    expect(call.name).toBe('GetProducts');
    expect(call.id).toContain('GetProducts-');
    expect(typeof call.responseTime).toBe('number');
    expect(typeof call.timestamp).toBe('number');
  });

  it('should dispatch to trackData with response data', async () => {
    const dataSpy = vi.fn();
    window.__demoInspectorStoreData = dataSpy;
    const responseData = { products: [{ id: '1' }] };
    const fetcher = vi.fn().mockResolvedValue(responseData);
    const wrapped = wrapFetcher(fetcher);
    await wrapped('query GetProducts { products { id } }', {});
    const call = dataSpy.mock.calls[0][0];
    expect(call.queryName).toBe('GetProducts');
    expect(call.source).toBe('catalog');
    expect(call.data).toEqual(responseData);
    expect(typeof call.timestamp).toBe('number');
  });

  it('should use Anonymous for unnamed queries', async () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    const fetcher = vi.fn().mockResolvedValue({});
    const wrapped = wrapFetcher(fetcher);
    await wrapped('{ products { id } }', {});
    expect(spy.mock.calls[0][0].name).toBe('Anonymous');
  });

  it('should detect the source from the response', async () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    const fetcher = vi.fn().mockResolvedValue({ facets: [] });
    const wrapped = wrapFetcher(fetcher);
    await wrapped('query GetFacets { facets }', {});
    expect(spy.mock.calls[0][0].source).toBe('search');
  });

  it('should skip tracking when skipTracking is true', async () => {
    const querySpy = vi.fn();
    const dataSpy = vi.fn();
    window.__demoInspectorTrackQuery = querySpy;
    window.__demoInspectorStoreData = dataSpy;
    const fetcher = vi.fn().mockResolvedValue({ products: [] });
    const wrapped = wrapFetcher(fetcher);
    const result = await wrapped('query GetProducts { products }', {}, { skipTracking: true });
    expect(querySpy).not.toHaveBeenCalled();
    expect(dataSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ products: [] });
  });

  it('should use source override when provided', async () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    const fetcher = vi.fn().mockResolvedValue({ something: true });
    const wrapped = wrapFetcher(fetcher);
    await wrapped('query Test { test }', {}, { source: 'search' });
    expect(spy.mock.calls[0][0].source).toBe('search');
  });

  it('should round responseTime to an integer', async () => {
    const spy = vi.fn();
    window.__demoInspectorTrackQuery = spy;
    const fetcher = vi.fn().mockResolvedValue({});
    const wrapped = wrapFetcher(fetcher);
    await wrapped('query Test { test }', {});
    const rt = spy.mock.calls[0][0].responseTime;
    expect(rt).toBe(Math.round(rt));
  });

  it('should work without either window global', async () => {
    const fetcher = vi.fn().mockResolvedValue({ storeConfig: {} });
    const wrapped = wrapFetcher(fetcher);
    const result = await wrapped('query GetConfig { storeConfig }', {});
    expect(result).toEqual({ storeConfig: {} });
  });
});
