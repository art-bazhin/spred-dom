import { writable } from 'spred';
import { component } from '../component/component';
import { h } from '../h/h';
import { node } from '../node/node';
import { text } from '../text/text';
import { getLIS, list } from './list';

describe('getLIS function', () => {
  it('finds LIS and returns it as new array', () => {
    expect(getLIS([]).join()).toBe('');
    expect(getLIS([1]).join()).toBe('1');
    expect(getLIS([1, 2, 3]).join()).toBe('1,2,3');
    expect(getLIS([3, 2, 1]).join()).toBe('1');
    expect(getLIS([3, 2, 1, 4]).join()).toBe('1,4');
    expect(getLIS([3, -1, 2, 1, 4]).join()).toBe('1,4');
    expect(getLIS([2, 8, 9, 5, 6, 7, 1]).join()).toBe('2,5,6,7');
  });
});

describe('list function', () => {
  const Item = component((_id: string) => {
    const id = () => _id;
    h('span', { id, textContent: id });
  });

  const FragmentItem = component((_id: string) => {
    const id = () => _id;
    h('span', { id, textContent: id });
    h('span', { id, textContent: id });
  });

  it('renders list of elements', () => {
    const arr = ['a', 'b', 'c', 'd'];

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abcd');
  });

  describe('reconciliation', () => {
    it('correctly fills and clears list', () => {
      const arr = writable<string[]>([]);

      const Div = component(() => {
        h('div', () => {
          list(arr, Item);
        });
      }) as () => HTMLDivElement;

      const div = Div();
      expect(div.textContent).toBe('');
      expect(div.children.length).toBe(0);

      arr(['a', 'b', 'c', 'd']);
      expect(div.textContent).toBe('abcd');
      expect(div.children.length).toBe(4);

      arr([]);
      expect(div.textContent).toBe('');
      expect(div.children.length).toBe(0);
    });

    it('correctly fills and clears list', () => {
      const arr = writable<string[]>([]);

      const Div = component(() => {
        h('div', () => {
          list(arr, Item);
        });
      }) as () => HTMLDivElement;

      const div = Div();
      expect(div.textContent).toBe('');
      expect(div.children.length).toBe(0);

      arr(['a', 'b', 'c', 'd']);
      expect(div.textContent).toBe('abcd');
      expect(div.children.length).toBe(4);

      arr([]);
      expect(div.textContent).toBe('');
      expect(div.children.length).toBe(0);
    });

    it('correctly adds bunch of items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd']);

      const Div = component(() => {
        h('div', () => {
          text(''); // test rendering with previous node
          list(arr, Item);
        });
      }) as () => HTMLDivElement;

      const div = Div();
      expect(div.textContent).toBe('abcd');
      expect(div.children.length).toBe(4);

      const first = div.firstElementChild;
      const last = div.lastElementChild;

      arr(['a', 'b', 'x', 'y', 'c', 'd']);
      expect(div.textContent).toBe('abxycd');
      expect(div.children.length).toBe(6);
      expect(first).toBe(div.firstElementChild);
      expect(last).toBe(div.lastElementChild);
    });
  });

  it('correctly removes bunch of items in existing list', () => {
    const arr = writable<string[]>(['a', 'b', 'x', 'y', 'c', 'd']);

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abxycd');
    expect(div.children.length).toBe(6);

    const first = div.firstElementChild;
    const last = div.lastElementChild;

    arr(['a', 'b', 'c', 'd']);
    expect(div.textContent).toBe('abcd');
    expect(div.children.length).toBe(4);
    expect(first).toBe(div.firstElementChild);
    expect(last).toBe(div.lastElementChild);
  });

  it('correctly neders same list', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abcde');
    expect(div.children.length).toBe(5);

    const a = div.children[0];
    const b = div.children[1];
    const c = div.children[2];
    const d = div.children[3];
    const e = div.children[4];

    arr(['a', 'b', 'c', 'd', 'e']);
    expect(div.textContent).toBe('abcde');
    expect(div.children.length).toBe(5);
    expect(a).toBe(div.children[0]);
    expect(b).toBe(div.children[1]);
    expect(c).toBe(div.children[2]);
    expect(d).toBe(div.children[3]);
    expect(e).toBe(div.children[4]);
  });

  it('correctly reorders items in existing list', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abcde');
    expect(div.children.length).toBe(5);

    const a = div.children[0];
    const b = div.children[1];
    const c = div.children[2];
    const d = div.children[3];
    const e = div.children[4];

    arr(['b', 'a', 'd', 'c', 'x', 'e']);
    expect(div.textContent).toBe('badcxe');
    expect(div.children.length).toBe(6);
    expect(a).toBe(div.children[1]);
    expect(b).toBe(div.children[0]);
    expect(c).toBe(div.children[3]);
    expect(d).toBe(div.children[2]);
    expect(e).toBe(div.children[5]);
  });

  it('correctly reorders items in existing list (case 2)', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e', 'f', 'g']);

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abcdefg');
    expect(div.children.length).toBe(7);

    arr(['a', 'c', 'b', 'h', 'f', 'e', 'x']);
    expect(div.textContent).toBe('acbhfex');
    expect(div.children.length).toBe(7);
  });

  it('correctly reorders fragment items in existing list', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

    const Div = component(() => {
      h('div', () => {
        list(arr, FragmentItem);
      });
    }) as () => HTMLDivElement;

    const div = Div() && Div(); // second render test
    expect(div.textContent).toBe('aabbccddee');
    expect(div.children.length).toBe(10);

    const a = div.children[0];
    const b = div.children[2];
    const c = div.children[4];
    const d = div.children[6];
    const e = div.children[8];

    arr(['b', 'a', 'd', 'c', 'x', 'e']);
    expect(div.textContent).toBe('bbaaddccxxee');
    expect(div.children.length).toBe(12);
    expect(a).toBe(div.children[2]);
    expect(b).toBe(div.children[0]);
    expect(c).toBe(div.children[6]);
    expect(d).toBe(div.children[4]);
    expect(e).toBe(div.children[10]);
  });

  it('correctly removes items from existing list', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abcde');
    expect(div.children.length).toBe(5);

    const a = div.children[0];
    const c = div.children[2];
    const e = div.children[4];

    arr(['a', 'c', 'e']);
    expect(div.textContent).toBe('ace');
    expect(div.children.length).toBe(3);
    expect(a).toBe(div.children[0]);
    expect(c).toBe(div.children[1]);
    expect(e).toBe(div.children[2]);
  });

  it('correctly adds items into existing list', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('abcde');
    expect(div.children.length).toBe(5);

    const a = div.children[0];
    const b = div.children[1];
    const c = div.children[2];
    const d = div.children[3];
    const e = div.children[4];

    arr(['a', 'b', 'x', 'c', 'y', 'd', 'e', 'z']);
    expect(div.textContent).toBe('abxcydez');
    expect(div.children.length).toBe(8);
    expect(a).toBe(div.children[0]);
    expect(b).toBe(div.children[1]);
    expect(c).toBe(div.children[3]);
    expect(d).toBe(div.children[5]);
    expect(e).toBe(div.children[6]);
  });

  it('can render empty items', () => {
    const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e', 'f', 'g']);

    const Item = component(() => {});

    const Div = component(() => {
      h('div', () => {
        list(arr, Item);
      });
    }) as () => HTMLDivElement;

    const div = Div();
    expect(div.textContent).toBe('');

    arr(['a', 'c', 'b', 'h', 'f', 'e', 'g']);
    expect(div.textContent).toBe('');
  });

  it('cleans up inner subscriptions on parent signal change', () => {
    const spy = jest.fn();
    const counter = writable(0);
    const toggle = writable(true);
    const arr = writable(['a', 'b', 'c']);

    const Item = component((str: string) => {
      counter.subscribe(() => spy());

      h('span', () => {
        h('span', { textContent: () => str });
      });
    });

    const List = component(() => {
      list(arr, Item);
    });

    const App = component(() => {
      node(() => toggle() && List());
    });

    App();
    expect(spy).toBeCalledTimes(3);

    counter(1);
    expect(spy).toBeCalledTimes(6);

    toggle(false);
    counter(2);
    expect(spy).toBeCalledTimes(6);
  });
});
