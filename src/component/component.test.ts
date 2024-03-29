import { h } from '../h/h';
import { component } from './component';

describe('component', () => {
  it('creates a function which returns DOM node', () => {
    const Test = component(() => {
      return h(null, () => {});
    });

    expect(typeof Test).toBe('function');
    expect(Test()).toBeInstanceOf(Node);
  });

  it('returns correct DOM structure on the first run', () => {
    const Test = component(() => {
      return h('div', { className: 'test' }, () => {
        h('span');
        h('ul', () => {
          h('li', { textContent: '1' });
          h('li', (li) => (li.textContent = '2'));
          h('li', { textContent: '3' });
        });
        h('div', (div) => (div.textContent = 'test'));
      });
    });

    const root = Test() as HTMLDivElement;
    expect(root.tagName).toBe('DIV');
    expect(root.className).toBe('test');

    const span = root.firstChild as HTMLSpanElement;
    expect(span.nodeType).toBe(Node.ELEMENT_NODE);
    expect(span.tagName).toBe('SPAN');

    const ul = root.children[1] as HTMLUListElement;
    expect(ul.tagName).toBe('UL');

    const div = root.lastElementChild as HTMLDivElement;
    expect(div.textContent).toBe('test');

    const li1 = ul.children[0] as HTMLLIElement;
    expect(li1.tagName).toBe('LI');
    expect(li1.textContent).toBe('1');

    const li2 = ul.children[1] as HTMLLIElement;
    expect(li2.tagName).toBe('LI');
    expect(li2.textContent).toBe('2');

    const li3 = ul.children[2] as HTMLLIElement;
    expect(li3.tagName).toBe('LI');
    expect(li3.textContent).toBe('3');
  });

  it('returns correct DOM structure on the second run', () => {
    const Test = component(() => {
      return h('div', { className: 'test' }, () => {
        h('span');
        h('ul', () => {
          h('li', { textContent: '1' });
          h('li', (li) => (li.textContent = '2'));
          h('li', { textContent: '3' });
        });
        h('div', (div) => (div.textContent = 'test'));
      });
    });

    Test();

    const root = Test() as HTMLDivElement;
    expect(root.tagName).toBe('DIV');
    expect(root.className).toBe('test');

    const span = root.firstChild as HTMLSpanElement;
    expect(span.nodeType).toBe(Node.ELEMENT_NODE);
    expect(span.tagName).toBe('SPAN');

    const ul = root.children[1] as HTMLUListElement;
    expect(ul.tagName).toBe('UL');

    const div = root.lastElementChild as HTMLDivElement;
    expect(div.textContent).toBe('test');

    const li1 = ul.children[0] as HTMLLIElement;
    expect(li1.tagName).toBe('LI');
    expect(li1.textContent).toBe('1');

    const li2 = ul.children[1] as HTMLLIElement;
    expect(li2.tagName).toBe('LI');
    expect(li2.textContent).toBe('2');

    const li3 = ul.children[2] as HTMLLIElement;
    expect(li3.tagName).toBe('LI');
    expect(li3.textContent).toBe('3');
  });

  it('can render document fragments', () => {
    const Test = component(() => {
      return h(null, () => {
        h('span', { textContent: '1' });
        h('span', (span) => (span.textContent = '2'));
        h('span', { textContent: '3' });
      });
    });

    const fragment = Test() as DocumentFragment;
    const span1 = fragment.children[0] as HTMLSpanElement;
    const span2 = fragment.children[1] as HTMLSpanElement;
    const span3 = fragment.children[2] as HTMLSpanElement;

    expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);

    expect(span1.tagName).toBe('SPAN');
    expect(span1.textContent).toBe('1');

    expect(span2.tagName).toBe('SPAN');
    expect(span2.textContent).toBe('2');

    expect(span3.tagName).toBe('SPAN');
    expect(span3.textContent).toBe('3');
  });
});
