import { writable } from 'spred';
import { component } from '../component/component';
import { h } from './h';

describe('h function', () => {
  it('creates element node inside component template', () => {
    const Span = component(() => {
      h('span');
    }) as () => HTMLSpanElement;

    expect(Span().tagName).toBe('SPAN');
  });

  it('can receive element props as second argument', () => {
    const Span = component(() => {
      h('span', { textContent: 'test' });
    }) as () => HTMLSpanElement;

    expect(Span().textContent).toBe('test');
  });

  it('can receive children template fn as second argument', () => {
    const Span = component(() => {
      h('span', () => {
        h('span');
      });
    }) as () => HTMLSpanElement;

    expect(Span().innerHTML).toBe('<span></span>');
  });

  it('can receive element props as second argument and children template fn as third argument', () => {
    const Span = component(() => {
      h('span', { className: 'test' }, () => {
        h('span');
      });
    }) as () => HTMLSpanElement;

    expect(Span().outerHTML).toBe('<span class="test"><span></span></span>');
  });

  it('can set element event handlers', () => {
    const onclick = jest.fn();

    const Button = component(() => {
      h('button', { onclick });
    });

    const button = Button() as HTMLButtonElement;

    button.click();
    expect(onclick).toBeCalledTimes(1);
  });

  it('can use functions as element props', () => {
    const textContent = () => 'text';

    const Button = component(() => {
      h('button', { textContent });
    });

    const button = Button() as HTMLButtonElement;

    expect(button.textContent).toBe('text');
  });

  it('can use signals as element props', () => {
    const textContent = writable('before');

    const Button = component(() => {
      h('button', { textContent });
    });

    const button = Button() as HTMLButtonElement;

    expect(button.textContent).toBe('before');

    textContent('after');
    expect(button.textContent).toBe('after');
  });

  it('turns the fn prop value into a signal if it has signal calls', () => {
    const val = writable('before');
    const textContent = () => val();

    const Button = component(() => {
      h('button', { textContent });
    });

    const button = Button() as HTMLButtonElement;

    expect(button.textContent).toBe('before');

    val('after');
    expect(button.textContent).toBe('after');
  });
});
