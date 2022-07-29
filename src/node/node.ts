import { createMemo, isSignal, Signal } from 'spred';
import { createBinding } from '../create-binding/create-binding';
import { addCleanup, createMark, insertBefore, removeNodes } from '../dom/dom';
import { state } from '../state/state';

type EmptyNode = null | false | undefined;

export function node(
  binding:
    | Node
    | EmptyNode
    | Signal<Node | EmptyNode>
    | (() => Node | EmptyNode)
) {
  createBinding((mark) => {
    if (state.isCreating) {
      state.setupQueue.push(() => setupNode(binding, mark));
      return;
    }

    setupNode(binding, mark);
  });
}

function setupNode(
  binding:
    | Node
    | EmptyNode
    | Signal<Node | EmptyNode>
    | (() => Node | EmptyNode),
  mark: Node | null
) {
  if (!mark || !binding) return;

  if (typeof binding === 'function') {
    if (isSignal(binding)) {
      setupSignalNode(binding, mark);
      return;
    }

    setupSignalNode(createMemo(binding), mark);
    return;
  }

  insertBefore(binding, mark);
}

function setupSignalNode(binding: Signal<Node | EmptyNode>, mark: Node) {
  let start = mark.previousSibling;

  if (!start) {
    start = createMark();
    insertBefore(start, mark);
  }

  addCleanup(
    mark,
    binding.subscribe((node) => {
      removeNodes(start!.nextSibling, mark);
      if (node) insertBefore(node, mark);
    })
  );
}
