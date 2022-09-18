import { writable } from 'spred';
import { component } from '../component/component';
import { h } from './h';

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
      })
    );

    expect(Span().innerHTML).toBe('<span></span>');
  });

  it('can receive element props as second argument and children template fn as third argument', () => {
    const Span = component(() =>
      h('span', { className: 'test' }, () => {
        h('span');
      })
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

  it('can use functions as element props', () => {
    const textContent = () => 'text';

    const Button = component(() =>
      h('button', { textContent, type: 'button' })
    );

    let button = Button();
    expect(button.textContent).toBe('text');
    expect(button.type).toBe('button');

    button = Button(); // second render test
    expect(button.textContent).toBe('text');
    expect(button.type).toBe('button');
  });

  it('can use signals as element props', () => {
    const textContent = writable('before');

    const Button = component(() => h('button', { textContent }));

    const button = Button();

    expect(button.textContent).toBe('before');

    textContent('after');
    expect(button.textContent).toBe('after');
  });

  it('turns the fn prop value into a signal', () => {
    const val = writable('before');
    const textContent = () => val();

    const Button = component(() => h('button', { textContent }));

    const button = Button();

    expect(button.textContent).toBe('before');

    val('after');
    expect(button.textContent).toBe('after');
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
      })
    );

    const button = Button();

    expect(button.getAttribute('class')).toBe('test');
    expect(button.getAttribute('data-foo')).toBe('bar');
    expect(button.getAttribute('data-bar')).toBe('');
    expect(button.getAttribute('false')).toBe(null);
    expect(button.getAttribute('null')).toBe(null);
    expect(button.getAttribute('undefined')).toBe(null);
  });

  it('can use fn as element attr value', () => {
    const Button = component(() =>
      h('button', {
        attrs: {
          class: () => 'test',
        },
      })
    );

    const button = Button();
    expect(button.getAttribute('class')).toBe('test');
  });

  it('can use signal as element attr value', () => {
    const value = writable<any>('foo');

    const Button = component(() =>
      h('button', {
        attrs: {
          class: value,
        },
      })
    );

    const button = Button();
    expect(button.getAttribute('class')).toBe('foo');

    value(null);
    expect(button.getAttribute('class')).toBe(null);

    value('bar');
    expect(button.getAttribute('class')).toBe('bar');

    value(false);
    expect(button.getAttribute('class')).toBe(null);

    value(true);
    expect(button.getAttribute('class')).toBe('');
  });

  it('turns the fn attr value into a signal', () => {
    const value = writable<any>('foo');

    const Button = component(() =>
      h('button', {
        attrs: {
          class: () => value(),
          'data-foo': 'bar',
        },
      })
    );

    Button();
    const button = Button(); // second render test

    expect(button.getAttribute('class')).toBe('foo');
    expect(button.getAttribute('data-foo')).toBe('bar');

    value(null);
    expect(button.getAttribute('class')).toBe(null);

    value('bar');
    expect(button.getAttribute('class')).toBe('bar');

    value(false);
    expect(button.getAttribute('class')).toBe(null);

    value(true);
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
      })
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
      })
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
      })
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
      })
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
      })
    );

    const button = Button();

    expect(button.className).toBe('foo');
    expect(button.textContent).toBe('bar');
  });

  it('correctly handles class prop with object value', () => {
    const Button = component(() =>
      h('button', {
        class: {
          foo: 'true',
          bar: () => true,
        },
      })
    );

    expect(Button().className).toBe('foo bar');
  });

  it('correctly handles class prop with array value', () => {
    const Button = component(() =>
      h('button', {
        class: ['foo', () => 'bar'],
      })
    );

    expect(Button().className).toBe('foo bar');
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
      })
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
