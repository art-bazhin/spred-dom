import { writable } from '@spred/core';
import { component } from '../component/component';
import { h } from '../h/h';
import { text } from './text';

describe('text function', () => {
  it('creates text node inside component template', () => {
    const Test = component(() =>
      h('div', () => {
        text('a');
        text('b');
      }),
    );

    const test = Test();

    expect(test.textContent).toBe('ab');
    expect(test.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(test.childNodes[0].textContent).toBe('a');
    expect(test.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
    expect(test.childNodes[1].textContent).toBe('b');
  });

  it('can use fn as node data', () => {
    const Test = component(() =>
      h('div', () => {
        text(() => 'a');
      }),
    );

    let test = Test();

    expect(test.textContent).toBe('a');
    expect(test.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(test.childNodes[0].textContent).toBe('a');

    test = Test(); // test second render

    expect(test.textContent).toBe('a');
    expect(test.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(test.childNodes[0].textContent).toBe('a');
  });

  it('can use signal as node data', () => {
    const value = writable('a');

    const Test = component(() => {
      return h('div', () => {
        text(value);
      });
    });

    const test = Test();

    expect(test.textContent).toBe('a');
    expect(test.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(test.childNodes[0].textContent).toBe('a');

    value.set('b');
    expect(test.childNodes[0].textContent).toBe('b');
  });

  it('turns the fn value into a signal', () => {
    const value = writable('a');

    const Test = component(() => {
      return h('div', () => {
        text(() => value.get());
      });
    });

    const test = Test();

    expect(test.textContent).toBe('a');
    expect(test.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(test.childNodes[0].textContent).toBe('a');

    value.set('b');
    expect(test.childNodes[0].textContent).toBe('b');
  });
});
