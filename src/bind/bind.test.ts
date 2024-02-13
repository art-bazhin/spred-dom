import { signal } from '@spred/core';
import { bind } from './bind';
import { fireEvent } from '@testing-library/dom';

describe('bind function', () => {
  it('sets node property by key', () => {
    const node = document.createTextNode('foo');

    bind(node, { textContent: 'bar' });
    expect(node.textContent).toBe('bar');

    bind(node, { textContent: 'qwe' });
    expect(node.textContent).toBe('qwe');
  });

  it('binds a signal to element property by key', () => {
    const node = document.createTextNode('foo');
    const text = signal('bar');

    bind(node, { textContent: text });
    expect(node.textContent).toBe('bar');

    text.set('qwe');
    expect(node.textContent).toBe('qwe');
  });

  it('binds a fn to element property by key', () => {
    const node = document.createTextNode('foo');
    const text = signal('bar');

    bind(node, { textContent: () => text.get() });
    expect(node.textContent).toBe('bar');

    text.set('qwe');
    expect(node.textContent).toBe('qwe');
  });

  it('allows to bind element attrs', () => {
    const button = document.createElement('button');
    const text = signal<string | null>('signal');

    bind(button, {
      attrs: {
        string: 'string',
        fn: () => text.get(),
        signal: text,
      },
    });

    expect(button.getAttribute('string')).toBe('string');
    expect(button.getAttribute('fn')).toBe('signal');
    expect(button.getAttribute('signal')).toBe('signal');

    text.set(null);
    expect(button.getAttribute('fn')).toBe(null);
    expect(button.getAttribute('signal')).toBe(null);
  });

  it('binds an event handler by key', () => {
    const button = document.createElement('button');
    const spy = jest.fn();

    bind(button, { onclick: spy });

    button.click();
    expect(spy).toHaveBeenCalledTimes(1);

    button.click();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('binds different types of properties', () => {
    const button = document.createElement('button');
    const text = signal('bar');
    const spy = jest.fn();

    bind(button, {
      className: 'foo',
      textContent: text,
      onclick: spy,
    });

    expect(button.textContent).toBe('bar');
    expect(button.className).toBe('foo');

    button.click();
    expect(spy).toHaveBeenCalledTimes(1);

    button.click();
    expect(spy).toHaveBeenCalledTimes(2);

    text.set('qwe');
    expect(button.textContent).toBe('qwe');
  });

  it('binds string and falsy class values', () => {
    const button = document.createElement('button');

    bind(button, { class: 'foo' });
    expect(button.getAttribute('class')).toBe('foo');

    bind(button, { class: false });
    expect(button.getAttribute('class')).toBe(null);

    bind(button, { class: 'bar' });
    expect(button.getAttribute('class')).toBe('bar');

    bind(button, { class: null });
    expect(button.getAttribute('class')).toBe(null);
  });

  it('binds signal class values', () => {
    const button = document.createElement('button');
    const className = signal<any>('foo');

    bind(button, { class: className });
    expect(button.getAttribute('class')).toBe('foo');

    className.set(false);
    expect(button.getAttribute('class')).toBe(null);

    className.set('bar');
    expect(button.getAttribute('class')).toBe('bar');

    className.set(null);
    expect(button.getAttribute('class')).toBe(null);
  });

  it('binds object class values', () => {
    const button = document.createElement('button');

    bind(button, {
      class: {
        foo: true,
        bar: false,
      },
    });

    expect(button.getAttribute('class')).toBe('foo');

    bind(button, {
      class: {
        foo: false,
        bar: false,
      },
    });

    expect(button.getAttribute('class')).toBe(null);

    bind(button, {
      class: {
        foo: null,
        bar: 1,
      },
    });

    expect(button.getAttribute('class')).toBe('bar');

    bind(button, {
      class: {
        foo: null,
        bar: 0,
      },
    });

    expect(button.getAttribute('class')).toBe(null);
  });

  it('binds array class values', () => {
    const button = document.createElement('button');

    bind(button, { class: ['foo'] });
    expect(button.getAttribute('class')).toBe('foo');

    bind(button, { class: [] });
    expect(button.getAttribute('class')).toBe(null);

    bind(button, { class: ['bar'] });
    expect(button.getAttribute('class')).toBe('bar');

    bind(button, { class: ['foo', 'bar'] });
    expect(button.getAttribute('class')).toBe('foo bar');
  });

  it('correctly handles one way binding of text input value prop', () => {
    const source = signal('foo');
    const value = signal(() => source.get());
    const input = document.createElement('input');

    bind(input, { value });
    expect(input.value).toBe('foo');

    source.set('bar');
    expect(input.value).toBe('bar');
  });

  it('correctly handles two way binding of text input value prop', () => {
    const value = signal('foo');
    const input = document.createElement('input');

    bind(input, { value });
    expect(input.value).toBe('foo');

    fireEvent.input(input, { target: { value: 'bar' } });
    expect(input.value).toBe('bar');
    expect(value.get()).toBe('bar');
  });
});
