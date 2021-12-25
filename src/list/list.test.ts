import { memo, writable } from 'spred';
import { h } from '..';
import { list } from './list';

describe('list', () => {
  const items = writable([
    {
      id: 1,
      value: '1',
    },

    {
      id: 2,
      value: '2',
    },

    {
      id: 3,
      value: '3',
    },

    {
      id: 4,
      value: '4',
    },

    {
      id: 5,
      value: '5',
    },
  ]);

  let div = h('div', [
    list(items, (item) => {
      const id = memo(() => 'item_' + item().id);
      const value = memo(() => item().value);

      return h(
        'span',
        {
          id,
        },
        [value]
      );
    }),
  ]);

  let first = div.querySelector('#item_1');
  let second = div.querySelector('#item_2');
  let third = div.querySelector('#item_3');
  let fourth = div.querySelector('#item_4');
  let fifth = div.querySelector('#item_5');

  it('renders dynamic list of elements', () => {
    expect(div.textContent).toBe('12345');
    expect(div.querySelector('#item_1')!.textContent).toBe('1');
    expect(div.querySelector('#item_2')!.textContent).toBe('2');
    expect(div.querySelector('#item_3')!.textContent).toBe('3');
    expect(div.querySelector('#item_4')!.textContent).toBe('4');
    expect(div.querySelector('#item_5')!.textContent).toBe('5');
  });

  it('correctly rerenders same items in a new order', () => {
    items(items().reverse());

    expect(div.textContent).toBe('54321');
    expect(div.querySelector('#item_1')).toBe(first);
    expect(div.querySelector('#item_2')).toBe(second);
    expect(div.querySelector('#item_3')).toBe(third);
    expect(div.querySelector('#item_4')).toBe(fourth);
    expect(div.querySelector('#item_5')).toBe(fifth);
  });

  it('correctly remove items from list', () => {
    items(items().filter((el) => el.id % 2));

    expect(div.textContent).toBe('531');
    expect(div.querySelector('#item_1')).toBe(first);
    expect(div.querySelector('#item_2')).toBe(null);
    expect(div.querySelector('#item_3')).toBe(third);
    expect(div.querySelector('#item_4')).toBe(null);
    expect(div.querySelector('#item_5')).toBe(fifth);
  });

  it('correctly adds new list items', () => {
    const oldItems = items();

    items([
      {
        id: 6,
        value: '6',
      },
      {
        id: 7,
        value: '7',
      },
      oldItems[0],
      {
        id: 8,
        value: '8',
      },
      oldItems[1],
      oldItems[2],
      {
        id: 9,
        value: '9',
      },
    ]);

    expect(div.textContent).toBe('6758319');
  });

  it('correctly clears the list', () => {
    items([]);
    expect(div.querySelectorAll('*').length).toBe(0);
    expect(div.textContent).toBe('');
  });

  it('can use custom key function', () => {
    div = h('div', [
      list(
        items,
        (item) => {
          const id = memo(() => 'item_' + item().id);
          const value = memo(() => item().value);

          return h(
            'span',
            {
              id,
            },
            [value]
          );
        },
        (item) => item.id
      ),
    ]);

    items([
      {
        id: 1,
        value: 'a',
      },
      {
        id: 2,
        value: 'b',
      },
      {
        id: 3,
        value: 'c',
      },
      {
        id: 4,
        value: 'd',
      },
    ]);

    first = div.querySelector('#item_1');
    fourth = div.querySelector('#item_4');

    expect(div.textContent).toBe('abcd');

    const arr = items();

    arr[0] = {
      id: 1,
      value: 'a1',
    };

    arr[3] = {
      id: 4,
      value: 'd4',
    };

    items(arr);

    expect(div.textContent).toBe('a1bcd4');
    expect(div.querySelector('#item_1')).toBe(first);
    expect(div.querySelector('#item_4')).toBe(fourth);
  });

  it('can render a list of fragments', () => {
    items([]);

    div = h('div', [
      list(items, (item) => {
        const id = memo(() => '' + item().id);
        const value = memo(() => item().value);

        return h([
          h('span', [id]), //
          h('span', [value]),
        ]);
      }),
    ]);

    expect(div.querySelectorAll('*').length).toBe(0);
    expect(div.textContent).toBe('');

    items([
      {
        id: 1,
        value: 'a',
      },
      {
        id: 2,
        value: 'b',
      },
      {
        id: 3,
        value: 'c',
      },
      {
        id: 4,
        value: 'd',
      },
    ]);

    expect(div.querySelectorAll('*').length).toBe(8);
    expect(div.textContent).toBe('1a2b3c4d');

    const arr = items();
    const el = arr[0];

    arr[0] = arr[3];
    arr[3] = el;

    items(arr);

    expect(div.querySelectorAll('*').length).toBe(8);
    expect(div.textContent).toBe('4d2b3c1a');
  });
});
