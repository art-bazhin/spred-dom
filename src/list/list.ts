import { isSignal, Signal } from 'spred';
import { addSub, createMark, insertBefore, removeNodes } from '../dom/dom';
import { next, state } from '../state/state';

let counter = 0;

export function list<T>(binding: Signal<T[]> | T[], mapFn: (el: T) => Node) {
  if (state.isCreating && state.root) {
    const mark = createMark();

    state.path += 'fbp';
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
