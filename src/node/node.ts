import { computed, isSignal, Signal } from '@spred/core';
import { createMark, Falsy, insertBefore, removeNodes } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

export function node(
  binding: Node | Falsy | Signal<Node | Falsy> | (() => Node | Falsy),
) {
  if (state.creating) {
    const mark = createMark();

    state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    state.root!.appendChild(mark);
    state.setupQueue.push(() => setupNode(binding, mark));

    return;
  }

  next();
  setupNode(binding, state.node!);
  next();
}

function setupNode(
  binding: Node | Falsy | Signal<Node | Falsy> | (() => Node | Falsy),
  mark: Node | null,
) {
  if (!mark || !binding) return;

  if (typeof binding === 'function') {
    setupSignalNode(computed(binding), mark);
    return;
  }

  if (typeof binding === 'object' && isSignal(binding)) {
    setupSignalNode(binding, mark);
    return;
  }

  insertBefore(binding, mark);
}

function setupSignalNode(binding: Signal<Node | Falsy>, mark: Node) {
  let start = mark.previousSibling;

  if (!start) {
    start = createMark();
    insertBefore(start, mark);
  }

  binding.subscribe((node) => {
    removeNodes(start!.nextSibling!, mark);
    if (node) insertBefore(node, mark);
  });
}
