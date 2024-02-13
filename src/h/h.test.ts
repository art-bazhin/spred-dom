import { writable } from '@spred/core';
import { component } from '../component/component';
import { h } from './h';

describe('h function', () => {
  it('TODO', () => {});

  it('creates element node inside component template', () => {
    const Span = component(() => h('span'));

    expect(Span().tagName).toBe('SPAN');
  });

  it('can receive element props as second argument', () => {
    const Span = component(() => h('span', { textContent: 'test' }));

    expect(Span().textContent).toBe('test');
  });

  it('can receive children template fn as second argument', () => {
    const Span = component(() =>
      h('span', () => {
        h('span');
      }),
    );

    expect(Span().innerHTML).toBe('<span></span>');
  });

  it('can receive element props as second argument and children template fn as third argument', () => {
    const Span = component(() =>
      h('span', { className: 'test' }, () => {
        h('span');
      }),
    );

    expect(Span().outerHTML).toBe('<span class="test"><span></span></span>');
  });

  it('gets DOM node as an argument of setup fn', () => {
    const spy = jest.fn();
    let ref: any;

    const Button = component(() =>
      h('button', (el) => {
        ref = el;
        el.onclick = spy;
      }),
    );

    expect(Button()).toBe(ref);

    ref.click();
    expect(spy).toHaveBeenCalledTimes(1);

    expect(Button()).toBe(ref); // second render test

    ref.click();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('can set element attrs', () => {
    const Button = component(() =>
      h('button', {
        attrs: {
          class: 'test',
          'data-foo': 'bar',
          'data-bar': true, // handle boolean attrs
          false: false, // handle falsy attrs
          null: null, // handle falsy attrs
          undefined: undefined, // handle falsy attrs
        },
      }),
    );

    let button = Button();

    expect(button.getAttribute('class')).toBe('test');
    expect(button.getAttribute('data-foo')).toBe('bar');
    expect(button.getAttribute('data-bar')).toBe('');
    expect(button.getAttribute('false')).toBe(null);
    expect(button.getAttribute('null')).toBe(null);
    expect(button.getAttribute('undefined')).toBe(null);

    button = Button(); // second render test

    expect(button.getAttribute('class')).toBe('test');
    expect(button.getAttribute('data-foo')).toBe('bar');
    expect(button.getAttribute('data-bar')).toBe('');
    expect(button.getAttribute('false')).toBe(null);
    expect(button.getAttribute('null')).toBe(null);
    expect(button.getAttribute('undefined')).toBe(null);
  });

  it('correctly renders nested elements', () => {
    const Div = component(() =>
      h('div', () => {
        h('div', () => {
          h('button', { textContent: 'foo' });
        });
        h('input', {
          id: 'foo',
          value: 'foo',
        });
      }),
    );

    const div1 = Div();
    const inp1 = div1.querySelector('#foo') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('foo');

    const div2 = Div(); // second render test
    const inp2 = div2.querySelector('#foo') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('foo');
  });

  it('correctly renders nested elements (case 2)', () => {
    const Div = component((id: string) =>
      h('div', { className: '1' }, () => {
        h('div', { className: '2' }, () => {
          h('button', { textContent: 'foo' }, (el) => {
            el.textContent = id;
          });
        });
        h('div', () => {
          h('div');
          h('div', () => {
            h('div');
            h('div');
          });
          h('div');
        });
        h(
          'input',
          {
            id: 'foo',
            value: 'foo',
          },
          (el) => {
            el.id = id;
            el.value = id;
          },
        );
      }),
    );

    const div1 = Div('a');
    const btn1 = div1.querySelector('button') as any;
    const inp1 = div1.querySelector('#a') as any;

    expect(btn1).toBeTruthy();
    expect(btn1.textContent).toBe('a');
    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');

    const div2 = Div('b');
    const btn2 = div2.querySelector('button') as any;
    const inp2 = div2.querySelector('#b') as any;

    expect(btn2).toBeTruthy();
    expect(btn2.textContent).toBe('b');
    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
  });

  it('correctly renders nested elements (case 3)', () => {
    const Div = component((str: string) =>
      h('div', () => {
        h('div', () => {
          h('div', () => {
            h('button', { textContent: 'foo' }, (el) => {
              el.textContent = str;
            });
          });
        });
        h(
          'input',
          {
            id: 'foo',
            value: 'foo',
          },
          (el) => {
            el.id = str;
            el.value = str;
          },
        );
      }),
    );

    const div1 = Div('a');
    const inp1 = div1.querySelector('#a') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');

    const div2 = Div('b');
    const inp2 = div2.querySelector('#b') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
  });

  it('correctly renders nested elements (case 4)', () => {
    const Div = component((str: string) =>
      h('div', () => {
        h('div', (el) => {
          el.id = 'test-id';

          h('button', { id: 'btn' }, (el) => {
            el.textContent = str;
          });
        });
        h(
          'input',
          {
            id: 'foo',
            value: 'foo',
          },
          (el) => {
            el.id = str;
            el.value = str;
          },
        );
      }),
    );

    const div1 = Div('a');
    const inp1 = div1.querySelector('#a') as any;
    const btn1 = div1.querySelector('#btn') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');
    expect(btn1.textContent).toBe('a');

    const div2 = Div('b');
    const inp2 = div2.querySelector('#b') as any;
    const btn2 = div2.querySelector('#btn') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
    expect(btn2.textContent).toBe('b');
  });

  it('can create dom node binding inside component template', () => {
    const a = document.createTextNode('a');

    const Div = component(() => {
      return h('div', () => h(a));
    });

    expect(Div().firstChild).toBe(a);
    expect(Div().firstChild).toBe(a); // second render test
  });

  it('can create multiple dom node binding inside component template', () => {
    const span1 = document.createElement('span');
    const span2 = document.createElement('span');
    const span3 = document.createElement('span');

    const Div = component(() => {
      return h('div', () => {
        h(span1);
        h(span2);
        h(span3);
      });
    });

    let div = Div();

    expect(div.children[0]).toBe(span1);
    expect(div.children[1]).toBe(span2);
    expect(div.children[2]).toBe(span3);

    div = Div();

    expect(div.children[0]).toBe(span1);
    expect(div.children[1]).toBe(span2);
    expect(div.children[2]).toBe(span3);
  });

  it('can use dom node binding as component template', () => {
    const a = document.createTextNode('a');

    const Fragment = component(() => {
      return h(a);
    });

    expect(Fragment().firstChild).toBe(a);
    expect(Fragment().firstChild).toBe(a); // second render test
    expect(Fragment().nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
  });

  it('can use signal as node binding', () => {
    const a = document.createElement('span');
    const b = document.createElement('span');

    const value = writable(a);

    const Div = component(() => {
      return h('div', () => h(value));
    });

    const div = Div() as HTMLDivElement;
    expect(div.firstElementChild).toBe(a);

    value.set(b);
    expect(div.firstElementChild).toBe(b);
  });

  it('turns fn values into signal node bindings', () => {
    const a = document.createElement('span');
    const b = document.createElement('span');

    const value = writable(a);

    const Div = component(() => {
      return h('div', () => {
        h('span');
        h(() => value.get());
      });
    });

    const div = Div() as HTMLDivElement;
    expect(div.children[1]).toBe(a);

    value.set(b);
    expect(div.children[1]).toBe(b);
  });

  it('renders falsy bindings as nothing', () => {
    const a = document.createElement('span');
    const value = writable<any>(a);

    const Div = component(() => {
      return h('div', () => {
        h(null);
        h('span');
        h(() => value.get());
      });
    });

    const div = Div() as HTMLDivElement;
    expect(div.children[1]).toBe(a);

    value.set(null);
    expect(div.children[1]).toBeUndefined();

    value.set(false);
    expect(div.children[1]).toBeUndefined();
  });

  // it('correctly handles one way binding of text input value prop', () => {
  //   const source = writable('foo');
  //   const value = computed(() => source.get());

  //   const Input = component(() =>
  //     h('input', {
  //       value,
  //     }),
  //   );

  //   const input = Input();

  //   expect(input.value).toBe('foo');

  //   source.set('bar');
  //   expect(input.value).toBe('bar');
  // });

  // it('correctly handles two way binding of text input value prop', () => {
  //   const value = writable('foo');
  //   const Input = component(() => h('input', { value }));

  //   const input = Input();

  //   expect(input.value).toBe('foo');

  //   fireEvent.input(input, { target: { value: 'bar' } });
  //   expect(input.value).toBe('bar');
  //   expect(value.get()).toBe('bar');
  // });
});
