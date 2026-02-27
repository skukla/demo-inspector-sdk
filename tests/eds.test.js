import { describe, it, expect, beforeEach } from 'vitest';
import { tagBlock, tagSlot } from '../src/eds.js';

describe('tagBlock', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('div');
  });

  it('should set data-block-name', () => {
    tagBlock(el, 'hero');
    expect(el.getAttribute('data-block-name')).toBe('hero');
  });

  it('should accept any string as block name', () => {
    tagBlock(el, 'product-cards');
    expect(el.getAttribute('data-block-name')).toBe('product-cards');
  });

  it('should overwrite a previous block name', () => {
    tagBlock(el, 'hero');
    tagBlock(el, 'cards');
    expect(el.getAttribute('data-block-name')).toBe('cards');
  });

  it('should throw when element is null', () => {
    expect(() => tagBlock(null, 'hero')).toThrow('must be a DOM Element');
  });

  it('should throw when element is a plain object', () => {
    expect(() => tagBlock({}, 'hero')).toThrow('must be a DOM Element');
  });

  it('should throw when name is empty string', () => {
    expect(() => tagBlock(el, '')).toThrow('non-empty string');
  });

  it('should throw when name is null', () => {
    expect(() => tagBlock(el, null)).toThrow('non-empty string');
  });
});

describe('tagSlot', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('div');
  });

  it('should set data-slot by default', () => {
    tagSlot(el, 'ProductDetails');
    expect(el.getAttribute('data-slot')).toBe('ProductDetails');
  });

  it('should set data-slot-key when useKey is true', () => {
    tagSlot(el, 'CartSummary', { useKey: true });
    expect(el.getAttribute('data-slot-key')).toBe('CartSummary');
    expect(el.getAttribute('data-slot')).toBeNull();
  });

  it('should set data-slot when useKey is false', () => {
    tagSlot(el, 'Header', { useKey: false });
    expect(el.getAttribute('data-slot')).toBe('Header');
    expect(el.getAttribute('data-slot-key')).toBeNull();
  });

  it('should set data-slot when options is undefined', () => {
    tagSlot(el, 'Footer');
    expect(el.getAttribute('data-slot')).toBe('Footer');
  });

  it('should throw when element is null', () => {
    expect(() => tagSlot(null, 'Slot')).toThrow('must be a DOM Element');
  });

  it('should throw when name is empty', () => {
    expect(() => tagSlot(el, '')).toThrow('non-empty string');
  });
});
