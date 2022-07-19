import { isSignal, Signal } from 'spred';
import { insertBefore, isFragment, removeNodes } from '../dom/dom';
import { next, state } from '../state/state';

export function node(binding: Node | Signal<Node>) {
  if (state.isCreating && state.root) {
    state.path += 'fbp';

    const mark = document.createComment('');

    state.bindingQueue.push({ mark, binding });
    state.root.appendChild(mark);

    return;
  }

  next();

  const pathState = state.pathState;
  const mark = pathState && pathState.node;

  setupBinding(binding, mark);

  next();
}

export function setupBinding(binding: Node | Signal<Node>, mark: Node | null) {
  if (!mark) return;

  if (isSignal(binding)) {
    let start: Node | null = null;

    binding.subscribe((node) => {
      if (start) removeNodes(start, mark);

      if (isFragment(node)) start = node.firstChild;
      else start = node;

      insertBefore(node, mark);
    });

    return;
  }

  insertBefore(binding, mark);
}
