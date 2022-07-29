import { isSignal } from 'spred';
import { addCleanup } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

export function text(str: string | (() => string)) {
  if (state.isCreating && !state.root) return;

  const isFn = typeof str === 'function';
  let node: Node | undefined;

  if (state.isCreating) {
    node = document.createTextNode('_');
    state.root!.appendChild(node);
  } else {
    next();
    node = state.pathState.node!;
  }

  if (isFn) {
    if (state.isCreating) {
      state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    } else next();

    if (isSignal(str)) {
      addCleanup(
        node,
        str.subscribe((v) => (node!.textContent = v))
      );
      return;
    }

    node.textContent = str();

    return;
  }

  if (state.isCreating) {
    state.path += FIRST_CHILD + PARENT_NODE;
    node.textContent = str;
  }
}
