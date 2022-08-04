import { writable } from 'spred';
import { component } from '../component/component';
import { h } from '../h/h';
import { node } from './node';

describe('node function', () => {
  it('creates dom node binding inside component template', () => {
    const a = document.createTextNode('a');

    const Div = component(() => {
      h('div', () => node(a));
    });

    expect(Div().firstChild).toBe(a);
    expect(Div().firstChild).toBe(a); // second render Div
  });

  it('can use signal as value', () => {
    const a = document.createElement('span');
    const b = document.createElement('span');

    const value = writable(a);

    const Div = component(() => {
      h('div', () => node(value));
    });

    const div = Div() as HTMLDivElement;
    expect(div.firstElementChild).toBe(a);

    value(b);
    expect(div.firstElementChild).toBe(b);
  });

  it('turns fn values into signals', () => {
    const a = document.createElement('span');
    const b = document.createElement('span');

    const value = writable(a);

    const Div = component(() => {
      h('div', () => {
        h('span');
        node(() => value());
      });
    });

    const div = Div() as HTMLDivElement;
    expect(div.children[1]).toBe(a);

    value(b);
    expect(div.children[1]).toBe(b);
  });

  it('renders falsy values as nothing', () => {
    const a = document.createElement('span');
    const value = writable<any>(a);

    const Div = component(() => {
      h('div', () => {
        node(null);
        h('span');
        node(() => value());
      });
    });

    const div = Div() as HTMLDivElement;
    expect(div.children[1]).toBe(a);

    value(null);
    expect(div.children[1]).toBeUndefined();

    value(false);
    expect(div.children[1]).toBeUndefined();
  });
});
