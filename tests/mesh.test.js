import { describe, it, expect, beforeEach } from 'vitest';
import { tagMeshSource, tagMeshSources, SOURCES } from '../src/mesh.js';

describe('SOURCES', () => {
  it('should expose commerce, catalog, and search constants', () => {
    expect(SOURCES.COMMERCE).toBe('commerce');
    expect(SOURCES.CATALOG).toBe('catalog');
    expect(SOURCES.SEARCH).toBe('search');
  });
});

describe('tagMeshSource', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('div');
  });

  it('should set data-inspector-source to commerce', () => {
    tagMeshSource(el, 'commerce');
    expect(el.getAttribute('data-inspector-source')).toBe('commerce');
  });

  it('should set data-inspector-source to catalog', () => {
    tagMeshSource(el, 'catalog');
    expect(el.getAttribute('data-inspector-source')).toBe('catalog');
  });

  it('should set data-inspector-source to search', () => {
    tagMeshSource(el, 'search');
    expect(el.getAttribute('data-inspector-source')).toBe('search');
  });

  it('should overwrite a previous source attribute', () => {
    tagMeshSource(el, 'commerce');
    tagMeshSource(el, 'catalog');
    expect(el.getAttribute('data-inspector-source')).toBe('catalog');
  });

  it('should throw for an invalid source id', () => {
    expect(() => tagMeshSource(el, 'invalid')).toThrow('invalid source');
  });

  it('should throw when element is null', () => {
    expect(() => tagMeshSource(null, 'commerce')).toThrow('must be a DOM Element');
  });

  it('should throw when element is a plain object', () => {
    expect(() => tagMeshSource({}, 'commerce')).toThrow('must be a DOM Element');
  });

  it('should throw when element is a string', () => {
    expect(() => tagMeshSource('div', 'commerce')).toThrow('must be a DOM Element');
  });
});

describe('tagMeshSources', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should tag elements matched by a CSS selector', () => {
    document.body.innerHTML = '<div class="item"></div><div class="item"></div>';
    tagMeshSources('.item', 'catalog');
    const items = document.querySelectorAll('.item');
    expect(items[0].getAttribute('data-inspector-source')).toBe('catalog');
    expect(items[1].getAttribute('data-inspector-source')).toBe('catalog');
  });

  it('should tag elements from a NodeList', () => {
    document.body.innerHTML = '<span></span><span></span>';
    const nodes = document.querySelectorAll('span');
    tagMeshSources(nodes, 'search');
    for (const node of nodes) {
      expect(node.getAttribute('data-inspector-source')).toBe('search');
    }
  });

  it('should tag elements from an array', () => {
    const els = [document.createElement('div'), document.createElement('div')];
    tagMeshSources(els, 'commerce');
    for (const el of els) {
      expect(el.getAttribute('data-inspector-source')).toBe('commerce');
    }
  });

  it('should skip non-Element items in an array', () => {
    const els = [document.createElement('div'), null, 'not-an-element'];
    tagMeshSources(els, 'commerce');
    expect(els[0].getAttribute('data-inspector-source')).toBe('commerce');
  });

  it('should throw for an invalid source id', () => {
    expect(() => tagMeshSources([], 'bad')).toThrow('invalid source');
  });

  it('should handle an empty selector result', () => {
    tagMeshSources('.nonexistent', 'catalog');
    // no error thrown, nothing to tag
  });
});
