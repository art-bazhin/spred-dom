import { computed, writable } from '@spred/core';
import { component } from '../component/component';
import { h } from './h';
import { fireEvent } from '@testing-library/dom';

describe('h function', () => {
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

  it('can set element event handlers', () => {
    const onclick = jest.fn();

    const Button = component(() => h('button', { onclick }));

    const button = Button();

    button.click();
    expect(onclick).toBeCalledTimes(1);

    button.click();
    expect(onclick).toBeCalledTimes(2);
  });

  it('can use functions as dynamic element props', () => {
    const Button = component((value: string) =>
      h('button', { textContent: () => value, type: 'button' }),
    );

    let button = Button('text');
    expect(button.textContent).toBe('text');
    expect(button.type).toBe('button');

    button = Button('another text'); // second render test
    expect(button.textContent).toBe('another text');
    expect(button.type).toBe('button');
  });

  it('can use signals as element props', () => {
    const textContent = writable('before');

    const Button = component(() => h('button', { textContent }));

    const button = Button();

    expect(button.textContent).toBe('before');

    textContent.set('after');
    expect(button.textContent).toBe('after');
  });

  it('can set element attrs', () => {
    const Button = component(() =>
      h('button', {
        onclick() {},
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

  it('can use fn as dynamic element attr value', () => {
    const Button = component((value: string) =>
      h('button', {
        attrs: {
          class: () => value,
        },
      }),
    );

    const button = Button('foo');
    expect(button.getAttribute('class')).toBe('foo');

    const button2 = Button('bar');
    expect(button2.getAttribute('class')).toBe('bar');
  });

  it('can use signal as element attr value', () => {
    const value = writable<any>('foo');

    const Button = component(() =>
      h('button', {
        attrs: {
          class: value,
        },
      }),
    );

    const button = Button();
    expect(button.getAttribute('class')).toBe('foo');

    value.set(null);
    expect(button.getAttribute('class')).toBe(null);

    value.set('bar');
    expect(button.getAttribute('class')).toBe('bar');

    value.set(false);
    expect(button.getAttribute('class')).toBe(null);

    value.set(true);
    expect(button.getAttribute('class')).toBe('');
  });

  it('sets binded values on second render', () => {
    const Div = component((str: () => string) =>
      h('div', () => {
        h('div', () => {
          h('button', { text: str });
        });
        h('input', {
          id: str,
          value: str,
        });
      }),
    );

    const div1 = Div(() => 'a');
    const inp1 = div1.querySelector('#a') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');

    const div2 = Div(() => 'b');
    const inp2 = div2.querySelector('#b') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
  });

  it('sets binded values on second render (case 2)', () => {
    const Div = component((str: () => string) =>
      h('div', () => {
        h('div', () => {
          h('button', { text: str });
        });
        h('div');
        h('input', {
          id: str,
          value: str,
        });
      }),
    );

    const div1 = Div(() => 'a');
    const inp1 = div1.querySelector('#a') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');

    const div2 = Div(() => 'b');
    const inp2 = div2.querySelector('#b') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
  });

  it('sets binded values on second render (case 3)', () => {
    const Div = component((str: () => string) =>
      h('div', () => {
        h('div', () => {
          h('div', () => {
            h('button', { text: str });
          });
        });
        h('input', {
          id: str,
          value: str,
        });
      }),
    );

    const div1 = Div(() => 'a');
    const inp1 = div1.querySelector('#a') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');

    const div2 = Div(() => 'b');
    const inp2 = div2.querySelector('#b') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
  });

  it('sets binded values on second render (case 4)', () => {
    const Div = component((str: () => string) =>
      h('div', () => {
        h('div', { id: () => 'test-id' }, () => {
          h('button', { id: 'btn', text: str });
        });
        h('input', {
          id: str,
          value: str,
        });
      }),
    );

    const div1 = Div(() => 'a');
    const inp1 = div1.querySelector('#a') as any;
    const btn1 = div1.querySelector('#btn') as any;

    expect(inp1).toBeTruthy();
    expect(inp1.value).toBe('a');
    expect(btn1.textContent).toBe('a');

    const div2 = Div(() => 'b');
    const inp2 = div2.querySelector('#b') as any;
    const btn2 = div2.querySelector('#btn') as any;

    expect(inp2).toBeTruthy();
    expect(inp2.value).toBe('b');
    expect(btn2.textContent).toBe('b');
  });

  it('correctly handles prop aliases', () => {
    const Button = component(() =>
      h('button', {
        class: 'foo',
        text: 'bar',
      }),
    );

    const button = Button();

    expect(button.className).toBe('foo');
    expect(button.textContent).toBe('bar');
  });

  it('correctly handles class prop with signal value', () => {
    const Button = component(() =>
      h('button', {
        class: writable('foo bar'),
      }),
    );

    expect(Button().className).toBe('foo bar');
  });

  it('correctly handles class prop with object value', () => {
    const Button = component(() =>
      h('button', {
        class: {
          foo: 'true',
          bar: () => true,
        },
      }),
    );

    expect(Button().className).toBe('foo bar');
  });

  it('correctly handles class prop with array value', () => {
    const Button = component(() =>
      h('button', {
        class: ['foo', () => 'bar'],
      }),
    );

    expect(Button().className).toBe('foo bar');
  });

  it('removes class attribute if all object props become falsy', () => {
    const foo = writable(true);

    const Button = component(() =>
      h('button', {
        class: { foo },
      }),
    );

    const button = Button();
    expect(button.className).toBe('foo');

    foo.set(false);
    expect(button.className).toBe('');
    expect(button.hasAttribute('class')).toBe(false);
  });

  it('correctly handles one way binding of text input value prop', () => {
    const source = writable('foo');
    const value = computed(() => source.get());

    const Input = component(() =>
      h('input', {
        value,
      }),
    );

    const input = Input();

    expect(input.value).toBe('foo');

    source.set('bar');
    expect(input.value).toBe('bar');
  });

  it('correctly handles two way binding of text input value prop', () => {
    const value = writable('foo');
    const Input = component(() => h('input', { value }));

    const input = Input();

    expect(input.value).toBe('foo');

    fireEvent.input(input, { target: { value: 'bar' } });
    expect(input.value).toBe('bar');
    expect(value.get()).toBe('bar');
  });

  it('correctly handles string input value', () => {
    const Input = component((value: string) =>
      h('input', {
        type: () => 'text',
        value,
      }),
    );

    expect(Input('foo').value).toBe('foo');
    expect(Input('bar').value).toBe('foo'); // second run test
  });

  it('correctly handles ref prop', () => {
    let button: any;

    const Div = component((id: () => string) =>
      h('div', () => {
        h('div', () => {
          h('div', { text: id });
        });
        h('button', {
          id,
          text: id,
          ref: (n) => (button = n),
        });
        h('span');
      }),
    );

    Div(() => 'foo');
    expect(button.id).toBe('foo');
    expect(button.textContent).toBe('foo');

    // second render test
    Div(() => 'bar');
    expect(button.id).toBe('bar');
    expect(button.textContent).toBe('bar');
  });

  it('correctly handles fragments', () => {
    const Fragment = component(() => h(() => {}));
    const fragment = Fragment();

    expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
  });
});
