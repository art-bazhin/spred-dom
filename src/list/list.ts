import {
  createComputed,
  createMemo,
  Signal,
  watch,
  createWritable,
  WritableSignal,
} from 'spred';

import {
  ChildValue,
  cleanupNode,
  createNode,
  isFragmentNode,
  markFragment,
  replaceChild,
} from '../dom/dom';

function addEl(
  map: Map<any, any>,
  key: any,
  value: any,
  mapFn: any,
  i: number,
  t: boolean,
  isEqual: any
) {
  const w = createWritable(value);
  const r = createMemo(w, isEqual);
  const node = createNode(mapFn(r, i));
  const n = isFragmentNode(node) ? markFragment(node) : node;
  const el = { w, r, n, i, t };

  map.set(key, el);

  return el;
}

export function list<T>(
  source: Signal<T[]>,
  mapFn: (signal: Signal<T>, i: number) => ChildValue,
  keyFn?: (el: T, i: number) => any,
  isEqual?: (value: T, prevValue: T) => boolean
) {
  const $keys = createComputed(() => {
    const arr = source();
    if (!keyFn) return arr.slice();
    return arr.map(keyFn);
  });

  let toggle: boolean;

  let current: {
    fragment: DocumentFragment;
    map: Map<
      any,
      {
        w: WritableSignal<any>;
        r: Signal<any>;
        n: Node;
        i: number;
        t: boolean;
      }
    >;
    keys: any[];
    start: Comment;
    end: Comment;
  };

  const cleanup = watch(() => {
    toggle = !toggle;

    const keys = $keys();
    const arr = source();

    let start = -1;
    let length = 0;

    const fragment = document.createDocumentFragment();
    markFragment(fragment);

    const data = current || {
      map: new Map(),
      keys: [],
      fragment,
      start: fragment.firstChild!,
      end: fragment.lastChild!,
    };

    if (!current) {
      data.fragment.appendChild(data.start);
      data.fragment.appendChild(data.end);
    }

    const map = data.map;
    const keysLength = keys.length;
    const halfKeysLength = keysLength / 2;
    const prevLength = data.keys.length;

    if (prevLength) {
      for (let i = 0; i < keysLength; i++) {
        const s = i;
        let e = i - 1;

        let old = map.get(keys[i]);
        let oldNext: any;

        for (let j = i; j < keysLength - 1; j++) {
          const nextIndex = j + 1;
          const nextKey = keys[nextIndex];

          if (!old) {
            break;
          } else {
            if (e < s) e = s;
          }

          oldNext = map.get(nextKey);

          if (!oldNext || oldNext.i - old.i !== 1) {
            i = j;
            break;
          }

          old = oldNext;
          e++;
        }

        const l = e - s + 1;

        if (l > length) {
          length = l;
          start = s;
        }

        if (length > halfKeysLength) break;
      }
    }

    const end = start + length - 1;
    const startNode = (start > -1 && map.get(keys[start])!.n) as Node;
    const endNode = data.end;
    const parent = endNode.parentNode!;

    keys.forEach((key, i) => {
      const value = arr[i];
      const el =
        data.map.get(key) || addEl(map, key, value, mapFn, i, toggle, isEqual);

      el.w(value);
      el.i = i;
      el.t = toggle;

      if (i < start) {
        replaceChild(parent, el.n, startNode);
      } else if (i > end) {
        replaceChild(parent, el.n, endNode);
      }
    });

    const obsoleteKeys = data.keys.filter((key) => map.get(key)!.t !== toggle);

    obsoleteKeys.forEach((key) => {
      const el = map.get(key)!;

      cleanupNode(el.n);
      replaceChild(parent, el.n);

      map.delete(key);
    });

    data.keys = keys;
    current = data;
  });

  (current!.start as any)._cleanup = cleanup;

  return current!.fragment as DocumentFragment;
}
