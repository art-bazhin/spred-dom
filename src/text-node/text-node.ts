import { isSignal } from 'spred';
import { addSub } from '../dom/dom';
import { next, state } from '../state/state';

export function textNode(str: string | (() => string)) {
  if (state.isCreating && !state.root) return;

  const isFn = typeof str === 'function';

  if (state.isCreating) {
    const node = document.createTextNode('_');

    state.root!.appendChild(node);

    if (isFn) {
      state.path += 'fbp';

      if (isSignal(str)) {
        addSub(
          node,
          str.subscribe((v) => (node.textContent = v))
        );
        return;
      }

      node.textContent = str();
    } else {
      state.path += 'fp';
      node.textContent = str;
    }

    return;
  }

  next();

  if (isFn) {
    const node = state.pathState.node as Text;
    next();

    if (isSignal(str)) {
      addSub(
        node,
        str.subscribe((v) => (node.textContent = v))
      );
      return;
    }

    node.textContent = str();

    return;
  }
}
