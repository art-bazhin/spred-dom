import { isSignal, Signal } from 'spred';
import { addSub, createMark, insertBefore, removeNodes } from '../dom/dom';
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

    addSub(
      mark,
      binding.subscribe((arr) => {
        removeNodes(start!.nextSibling, mark);

        for (let el of arr) {
          const node = mapFn(el);
          insertBefore(node, mark);
        }
      })
    );

    return;
  }

  for (let el of binding) {
    insertBefore(mapFn(el), mark);
  }
}
