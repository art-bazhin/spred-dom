import { createMemo, isSignal, Signal } from 'spred';
import { addSub, createMark, insertBefore, removeNodes } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

type EmptyNode = null | false | undefined;

export function node(
  binding:
    | Node
    | EmptyNode
    | Signal<Node | EmptyNode>
    | (() => Node | EmptyNode)
) {
  if (state.isCreating && state.root) {
    const mark = createMark();

    state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    state.setupQueue.push(() => setupNode(binding, mark));
    state.root.appendChild(mark);

    return;
  }

  next();

  const pathState = state.pathState;
  const mark = pathState && pathState.node;

  setupNode(binding, mark);

  next();
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

  addSub(
    mark,
    binding.subscribe((node) => {
      removeNodes(start!.nextSibling, mark);
      if (node) insertBefore(node, mark);
    })
  );
}
