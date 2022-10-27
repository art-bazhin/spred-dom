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
    return h('span', { id, textContent: id });
  });

  const FragmentItem = component((_id: string) => {
    const id = () => _id;
    return h(() => {
      h('span', { id, textContent: id });
      h('span', { id, textContent: id });
    });
  });

  it('renders list of elements', () => {
    const arr = ['a', 'b', 'c', 'd'];

    const Div = component(() =>
      h('div', () => {
        list(arr, Item);
      })
    );

    const div = Div();
    expect(div.textContent).toBe('abcd');
  });

  it('cleans up inner subscriptions on parent signal change', () => {
    const spy = jest.fn();
    const counter = writable(0);
    const toggle = writable(true);
    const arr = writable(['a', 'b', 'c']);

    const Item = component((str: string) => {
      counter.subscribe(() => spy());

      return h('span', () => {
        h('span', { textContent: () => str });
      });
    });

    const List = component(() =>
      h(() => {
        list(arr, Item);
      })
    );

    const App = component(() =>
      h(() => {
        node(() => toggle() && List());
      })
    );

    App();
    expect(spy).toBeCalledTimes(3);

    counter(1);
    expect(spy).toBeCalledTimes(6);

    toggle(false);
    counter(2);
    expect(spy).toBeCalledTimes(6);
  });

  describe('reconciliation', () => {
    it('correctly fills and clears list', () => {
      const arr = writable<string[]>([]);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

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

      const Div = component(() =>
        h('div', () => {
          text(''); // test rendering with previous node
          list(arr, Item);
        })
      );

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

    it('correctly removes bunch of items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'x', 'y', 'c', 'd']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

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

    it('correctly renders same list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

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

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

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

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abcdefg');
      expect(div.children.length).toBe(7);

      arr(['a', 'c', 'b', 'h', 'f', 'e', 'x']);
      expect(div.textContent).toBe('acbhfex');
      expect(div.children.length).toBe(7);
    });

    it('correctly reorders fragment items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

      const Div = component(() =>
        h('div', () => {
          list(arr, FragmentItem);
        })
      );

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

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

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

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

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

      const Item = component(() => h(() => {}));

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('');

      arr(['a', 'c', 'b', 'h', 'f', 'e', 'g']);
      expect(div.textContent).toBe('');
    });
  });

  describe('reconciliation of mutated array', () => {
    it('correctly fills and clears list', () => {
      const arr = writable<string[]>([]);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('');
      expect(div.children.length).toBe(0);

      arr().splice(0, 0, 'a', 'b', 'c', 'd');
      arr.notify();

      expect(div.textContent).toBe('abcd');
      expect(div.children.length).toBe(4);

      arr().length = 0;
      arr.notify();

      expect(div.textContent).toBe('');
      expect(div.children.length).toBe(0);
    });

    it('correctly adds bunch of items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd']);

      const Div = component(() =>
        h('div', () => {
          text(''); // test rendering with previous node
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abcd');
      expect(div.children.length).toBe(4);

      const first = div.firstElementChild;
      const last = div.lastElementChild;

      arr().splice(2, 0, 'x', 'y');
      arr.notify();

      expect(div.textContent).toBe('abxycd');
      expect(div.children.length).toBe(6);
      expect(first).toBe(div.firstElementChild);
      expect(last).toBe(div.lastElementChild);
    });

    it('correctly removes and adds bunch of items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'x', 'y', 'c', 'd']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abxycd');
      expect(div.children.length).toBe(6);

      const first = div.firstElementChild;
      const last = div.lastElementChild;

      arr().splice(2, 2);
      arr.notify();

      expect(div.textContent).toBe('abcd');
      expect(div.children.length).toBe(4);
      expect(first).toBe(div.firstElementChild);
      expect(last).toBe(div.lastElementChild);

      ['a', 'b', 'x', 'y', 'c', 'd'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('abxycd');
      expect(div.children.length).toBe(6);
    });

    it('correctly reorders items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abcde');
      expect(div.children.length).toBe(5);

      const a = div.children[0];
      const b = div.children[1];
      const c = div.children[2];
      const d = div.children[3];
      const e = div.children[4];

      ['b', 'a', 'd', 'c', 'x', 'e'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('badcxe');
      expect(div.children.length).toBe(6);
      expect(a).toBe(div.children[1]);
      expect(b).toBe(div.children[0]);
      expect(c).toBe(div.children[3]);
      expect(d).toBe(div.children[2]);
      expect(e).toBe(div.children[5]);

      ['a', 'b', 'c', 'd', 'x', 'e'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('abcdxe');
      expect(div.children.length).toBe(6);
      expect(a).toBe(div.children[0]);
      expect(b).toBe(div.children[1]);
      expect(c).toBe(div.children[2]);
      expect(d).toBe(div.children[3]);
      expect(e).toBe(div.children[5]);
    });

    it('correctly reorders items in existing list (case 2)', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e', 'f', 'g']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abcdefg');
      expect(div.children.length).toBe(7);

      ['a', 'c', 'b', 'h', 'f', 'e', 'x'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('acbhfex');
      expect(div.children.length).toBe(7);

      ['c', 'a', 'b', 'h', 'f', 'x', 'e'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('cabhfxe');
      expect(div.children.length).toBe(7);
    });

    it('correctly reorders fragment items in existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

      const Div = component(() =>
        h('div', () => {
          list(arr, FragmentItem);
        })
      );

      const div = Div() && Div(); // second render test
      expect(div.textContent).toBe('aabbccddee');
      expect(div.children.length).toBe(10);

      const a = div.children[0];
      const b = div.children[2];
      const c = div.children[4];
      const d = div.children[6];
      const e = div.children[8];

      ['b', 'a', 'd', 'c', 'x', 'e'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('bbaaddccxxee');
      expect(div.children.length).toBe(12);
      expect(a).toBe(div.children[2]);
      expect(b).toBe(div.children[0]);
      expect(c).toBe(div.children[6]);
      expect(d).toBe(div.children[4]);
      expect(e).toBe(div.children[10]);

      ['a', 'b', 'c', 'd', 'x', 'e'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('aabbccddxxee');
      expect(div.children.length).toBe(12);
      expect(a).toBe(div.children[0]);
      expect(b).toBe(div.children[2]);
      expect(c).toBe(div.children[4]);
      expect(d).toBe(div.children[6]);
      expect(e).toBe(div.children[10]);
    });

    it('correctly removes items from existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abcde');
      expect(div.children.length).toBe(5);

      const a = div.children[0];
      const b = div.children[1];
      const c = div.children[2];
      const e = div.children[4];

      ['a', 'b', 'c', 'e'].forEach((el, i) => (arr()[i] = el));
      arr().length = 4;
      arr.notify();

      expect(div.textContent).toBe('abce');
      expect(div.children.length).toBe(4);
      expect(a).toBe(div.children[0]);
      expect(b).toBe(div.children[1]);
      expect(c).toBe(div.children[2]);
      expect(e).toBe(div.children[3]);

      ['a', 'c', 'e'].forEach((el, i) => (arr()[i] = el));
      arr().length = 3;
      arr.notify();

      expect(div.textContent).toBe('ace');
      expect(div.children.length).toBe(3);
      expect(a).toBe(div.children[0]);
      expect(c).toBe(div.children[1]);
      expect(e).toBe(div.children[2]);
    });

    it('correctly adds items into existing list', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e']);

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('abcde');
      expect(div.children.length).toBe(5);

      const a = div.children[0];
      const b = div.children[1];
      const c = div.children[2];
      const d = div.children[3];
      const e = div.children[4];

      ['a', 'b', 'x', 'c', 'y', 'd', 'e', 'z'].forEach(
        (el, i) => (arr()[i] = el)
      );
      arr.notify();

      expect(div.textContent).toBe('abxcydez');
      expect(div.children.length).toBe(8);
      expect(a).toBe(div.children[0]);
      expect(b).toBe(div.children[1]);
      expect(c).toBe(div.children[3]);
      expect(d).toBe(div.children[5]);
      expect(e).toBe(div.children[6]);

      ['a', 'b', 'x', 'c', 'y', 'd', 'e', 'z', 'j', 'k'].forEach(
        (el, i) => (arr()[i] = el)
      );
      arr.notify();

      expect(div.textContent).toBe('abxcydezjk');
      expect(div.children.length).toBe(10);
      expect(a).toBe(div.children[0]);
      expect(b).toBe(div.children[1]);
      expect(c).toBe(div.children[3]);
      expect(d).toBe(div.children[5]);
      expect(e).toBe(div.children[6]);
    });

    it('can render empty items', () => {
      const arr = writable<string[]>(['a', 'b', 'c', 'd', 'e', 'f', 'g']);

      const Item = component(() => h(() => {}));

      const Div = component(() =>
        h('div', () => {
          list(arr, Item);
        })
      );

      const div = Div();
      expect(div.textContent).toBe('');

      ['a', 'c', 'b', 'h', 'f', 'e', 'g'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('');

      ['a', 'c', 'b', 'f', 'h', 'e', 'g'].forEach((el, i) => (arr()[i] = el));
      arr.notify();

      expect(div.textContent).toBe('');
    });
  });
});
