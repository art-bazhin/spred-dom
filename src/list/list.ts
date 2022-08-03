import { collect, isSignal, Signal } from 'spred';
import { createMark, insertBefore, isFragment, removeNodes } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

export function list<T>(binding: Signal<T[]> | T[], mapFn: (el: T) => Node) {
  if (state.isCreating && state.root) {
    const mark = createMark();

    state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    state.setupQueue.push(() => setupList(binding, mapFn, mark));
    state.root.appendChild(mark);

    return;
  }

  next();

  const pathState = state.pathState;
  const mark = pathState && pathState.node;

  setupList(binding, mapFn, mark);

  next();
}

function setupList<T>(
  binding: Signal<T[]> | T[],
  mapFn: (el: T) => Node,
  mark: Node | null
) {
  if (!mark) return;

  if (isSignal(binding)) {
    let start = mark.previousSibling;

    if (!start) {
      start = createMark();
      insertBefore(start, mark);
    }

    let oldArr: T[] = [];
    let nodeMap = new Map<any, Node>();
    let cleanupMap = new Map<any, () => any>();

    // the algorithm is taken from
    // https://github.com/localvoid/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1366

    binding.subscribe((newArr) => {
      const parent = mark.parentNode!;

      let oldLength = oldArr.length;
      let newLength = newArr.length;

      if (!newLength && !oldLength) return;

      const minLength = Math.min(oldLength, newLength);

      let s = 0; // start index
      let a = oldLength - 1; // old array end index
      let b = newLength - 1; // new array end index

      for (let i = 0; i < minLength; ++i) {
        let shouldStop = 0;

        if (oldArr[s] === newArr[s]) ++s;
        else ++shouldStop;

        if (oldArr[a] === newArr[b]) --a, --b;
        else ++shouldStop;

        if (shouldStop === 2) break;
      }

      // lists are equal
      if (a < 0 && b < 0) return;

      // add nodes
      if (s > a) {
        const index = b + 1;
        const endNode =
          index === newLength ? mark : nodeMap.get(newArr[index])!;

        while (s <= b) {
          insertBefore(
            createListNode(newArr[s], mapFn, nodeMap, cleanupMap),
            endNode,
            parent
          );
          ++s;
        }

        oldArr = newArr;

        return;
      }

      // remove nodes
      if (s > b) {
        const endIndex = a + 1;
        const startNode = nodeMap.get(oldArr[s])!;
        const endNode =
          endIndex === oldLength ? mark : nodeMap.get(oldArr[endIndex])!;

        removeNodes(startNode, endNode, parent);

        while (s < endIndex) {
          const el = oldArr[s++];

          cleanupMap.get(el)!();
          cleanupMap.delete(el);
          nodeMap.delete(el);
        }

        oldArr = newArr;

        return;
      }

      // reconcile
      const positions = [];
      const elementIndexMap = new Map<T, number>();

      let removedCount = 0;
      let last = 0;
      let moved = false;

      oldLength = a + 1 - s;
      newLength = b + 1 - s;

      for (let i = 0; i < newLength; ++i) {
        const index = s + i;
        positions[i] = -1;
        elementIndexMap.set(newArr[index], index);
      }

      for (let i = 0; i < oldLength; ++i) {
        const oldIndex = s + i;
        const el = oldArr[oldIndex];
        const newIndex = elementIndexMap.get(el);

        if (newIndex === undefined) {
          const node = nodeMap.get(el)!;
          const end = ((node as any).$lc || node).nextSibling;

          removeNodes(node, end, parent);
          cleanupMap.get(el)!();
          cleanupMap.delete(el);
          nodeMap.delete(el);
          removedCount++;

          continue;
        }

        positions[newIndex - s] = oldIndex;

        if (!moved) {
          if (last > newIndex) moved = true;
          else last = newIndex;
        }
      }

      if (moved) {
        const lis = getLIS(positions);

        for (let i = 0, j = lis.length - 1; i < newLength; ++i) {
          const position = positions[newLength - i - 1];
          const lisPosition = lis[j];

          if (position === lisPosition) {
            --j;
            continue;
          }

          const index = b - i;
          const el = newArr[index];
          const nextEl = newArr[index + 1];
          const nextNode =
            nextEl === undefined //
              ? mark
              : nodeMap.get(nextEl)!;

          if (position === lisPosition) {
            --j;
            continue;
          }

          if (position < 0) {
            insertBefore(
              createListNode(el, mapFn, nodeMap, cleanupMap),
              nextNode,
              parent
            );
          } else {
            const node = nodeMap.get(el)!;
            const lastChild = (node as any).$lc;

            if (lastChild && node !== lastChild) {
              let current = node;
              let next: any;

              while (1) {
                next = current.nextSibling!;
                insertBefore(current, nextNode, parent);
                if (current === lastChild) break;
                current = next;
              }
            } else {
              insertBefore(node, nextNode, parent);
            }
          }
        }
      } else if (oldLength - removedCount !== newLength) {
        for (let i = 0; i < newLength; ++i) {
          if (positions[newLength - i - 1] !== -1) continue;

          const index = b - i;
          const el = newArr[index];
          const nextEl = newArr[index + 1];
          const nextNode =
            nextEl === undefined //
              ? mark
              : nodeMap.get(nextEl)!;

          insertBefore(
            createListNode(el, mapFn, nodeMap, cleanupMap),
            nextNode,
            parent
          );
        }
      }

      oldArr = newArr;
    });

    return;
  }

  const parent = mark.parentNode!;

  for (let el of binding) {
    insertBefore(mapFn(el), mark, parent);
  }
}

export function getLIS(arr: number[]) {
  const arrLength = arr.length;
  const endIndexes = [];
  const predecessors = [];

  let lisLength = 0;

  for (let i = 0; i < arrLength; ++i) {
    const el = arr[i];

    if (el < 0) continue;

    let lo = 1;
    let hi = lisLength + 1;

    while (lo < hi) {
      const mid = lo + (0 | ((hi - lo) / 2));

      if (arr[endIndexes[mid]] > el) hi = mid;
      else lo = mid + 1;
    }

    predecessors[i] = endIndexes[lo - 1];
    endIndexes[lo] = i;

    if (lo > lisLength) lisLength = lo;
  }

  const lis = [];

  let i = lisLength;
  let k = endIndexes[lisLength];

  while (i) {
    lis[--i] = arr[k];
    k = predecessors[k];
  }

  return lis;
}

function createListNode<T>(
  el: T,
  mapFn: (e: T) => Node,
  nodeMap: Map<T, Node>,
  cleanupMap: Map<T, () => any>
) {
  let node: any;

  const cleanup = collect(() => {
    node = mapFn(el);
  });

  let nodeInMap: Node = node;

  if (isFragment(node)) {
    const firstChild = node.firstChild;

    nodeInMap = createMark();

    if (firstChild) node.insertBefore(nodeInMap, firstChild);
    else node.appendChild(nodeInMap);

    (nodeInMap as any).$lc = node.lastChild;
  }

  nodeMap.set(el, nodeInMap);
  cleanupMap.set(el, cleanup);

  return node as Node;
}
