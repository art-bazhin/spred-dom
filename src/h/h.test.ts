import { createMemo, onActivate, onDeactivate, createWritable } from 'spred';
import { h } from './h';

describe('h function', () => {
  it('creates document fragment', () => {
    const fragment = h([null, '1', 2, h('span', [3])]);

    expect(fragment).toBeInstanceOf(DocumentFragment);
    expect(fragment.textContent).toBe('123');
  });

  it('creates an empty html element', () => {
    const div = h('div');

    expect(div).toBeInstanceOf(Element);
    expect(div.tagName).toBe('DIV');
    expect(div.childNodes.length).toBe(0);

    const a = h('a');

    expect(a).toBeInstanceOf(Element);
    expect(a.tagName).toBe('A');
    expect(a.childNodes.length).toBe(0);
  });

  it('creates a html element with props', () => {
    const a = h('a', {
      href: 'https://example.com/',
      target: '_blank',
    });

    expect(a).toBeInstanceOf(Element);
    expect(a.tagName).toBe('A');
    expect(a.href).toBe('https://example.com/');
    expect(a.target).toBe('_blank');
  });

  it('creates a html element with attrs', () => {
    const a = h('a', {
      attrs: {
        href: 'https://example.com/',
        target: '_blank',
        dataTest: 123,
      },
    });

    expect(a).toBeInstanceOf(Element);
    expect(a.tagName).toBe('A');
    expect(a.href).toBe('https://example.com/');
    expect(a.target).toBe('_blank');
    expect(a.getAttribute('data-test')).toBe('123');
  });

  it('creates a html element with props and children', () => {
    const a = h(
      'a',
      {
        attrs: {
          dataTest: 123,
        },
        href: 'https://example.com/',
        target: '_blank',
      },
      [h('span', ['test'])]
    );

    expect(a).toBeInstanceOf(Element);
    expect(a.tagName).toBe('A');
    expect(a.href).toBe('https://example.com/');
    expect(a.target).toBe('_blank');
    expect(a.getAttribute('data-test')).toBe('123');
    expect((a.childNodes[0] as any).tagName).toBe('SPAN');
    expect(a.textContent).toBe('test');
  });

  describe('props', () => {
    it('can use a signal as a value', () => {
      const checked = createWritable(false);

      const input = h('input', {
        type: 'checkbox',
        checked,
      });

      expect(input.checked).toBe(false);

      checked(true);
      expect(input.checked).toBe(true);

      checked(false);
      expect(input.checked).toBe(false);
    });
  });

  describe('attrs', () => {
    it('renders true as empty string', () => {
      const div = h('div', {
        attrs: {
          dataValue: true,
        },
      });

      expect(div.getAttribute('data-value')).toBe('');
    });

    it('removes attr if the value is false, null or undefined', () => {
      const div = h('div', {
        attrs: {
          dataFalse: false,
          dataNull: null,
          dataUndefined: undefined,
        },
      });

      expect(div.getAttribute('data-false')).toBe(null);
      expect(div.getAttribute('data-null')).toBe(null);
      expect(div.getAttribute('data-undefined')).toBe(null);
    });

    it('can use a signal as a value', () => {
      const dataValue = createWritable<any>();

      const div = h('div', {
        attrs: {
          dataValue,
        },
      });

      expect(div.getAttribute('data-value')).toBe(null);

      dataValue('value');
      expect(div.getAttribute('data-value')).toBe('value');

      dataValue(true);
      expect(div.getAttribute('data-value')).toBe('');

      dataValue(false);
      expect(div.getAttribute('data-value')).toBe(null);

      dataValue(null);
      expect(div.getAttribute('data-value')).toBe(null);
    });
  });

  describe('children', () => {
    it('can be empty', () => {
      const div = h('div', []);

      expect(div.childNodes.length).toBe(0);
    });

    it('does not render falsy values as elements', () => {
      const div = h('div', [undefined, false, null]);

      expect(div.querySelectorAll('*').length).toBe(0);
    });

    it('can render text nodes', () => {
      const div = h('div', ['one', ' two', ' three', ' four']);

      expect(div.childNodes.length).toBe(4);
      expect(div.textContent).toBe('one two three four');
    });

    it('can render element nodes', () => {
      const a = document.createElement('a');
      const span = h('span');

      const div = h('div', [a, span]);

      expect(div.childNodes[0]).toBe(a);
      expect(div.childNodes[1]).toBe(span);
    });

    it('can render document fragments', () => {
      const fragment = document.createDocumentFragment();
      const span = h('span', ['span']);

      fragment.appendChild(span);

      const div = h('div', [fragment]);

      expect(div.querySelector('span')).toBe(span);
    });

    it('can render signals', () => {
      const node = createWritable<any>();

      const fragment = document.createDocumentFragment();

      fragment.appendChild(h('span', ['a']));
      fragment.appendChild(h('span', ['b']));

      const div = h('div', [
        h('span', ['1']),
        node,
        h('span', ['2']),
        h('span', ['3']),
      ]);

      expect(div.childNodes[1]).toBeInstanceOf(Comment);
      expect(div.textContent).toBe('123');

      node('text');
      expect(div.childNodes[1]).toBeInstanceOf(Text);
      expect(div.textContent).toBe('1text23');

      node('text text');
      expect(div.childNodes[1]).toBeInstanceOf(Text);
      expect(div.textContent).toBe('1text text23');

      node(fragment);
      expect(div.textContent).toBe('1ab23');

      node(h(['a', 'b', h('span', ['c']), null, 'd']));
      expect(div.textContent).toBe('1abcd23');

      node(h('div', ['div']));
      expect(div.childNodes[1]).toBeInstanceOf(Element);
      expect((div.childNodes[1] as any).tagName).toBe('DIV');
      expect(div.childNodes[1].textContent).toBe('div');
      expect(div.textContent).toBe('1div23');
    });

    it('cleanup used signals after removal from document', () => {
      let valueCounter = 0;
      let anotherValueCounter = 0;

      const toggle = createWritable(true);
      const value = createWritable('true');
      const anotherValue = createWritable(' 1');

      onActivate(value, () => valueCounter++);
      onDeactivate(value, () => valueCounter++);

      onActivate(anotherValue, () => anotherValueCounter++);
      onDeactivate(anotherValue, () => anotherValueCounter++);

      const div = h('div', [
        createMemo(() =>
          toggle()
            ? h(
                'div',
                {
                  textContent: value,
                },
                [h('div', [anotherValue])]
              )
            : 'false'
        ),
      ]);

      expect(valueCounter).toBe(1);
      expect(anotherValueCounter).toBe(1);
      expect(div.textContent).toBe('true 1');

      toggle(false);
      expect(valueCounter).toBe(2);
      expect(anotherValueCounter).toBe(2);
      expect(div.textContent).toBe('false');
    });
  });
});
