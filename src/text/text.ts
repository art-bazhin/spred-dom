import { isSignal } from 'spred';
import { next, state } from '../state/state';

export function text(str: string | (() => string)) {
  if (state.isCreating && !state.root) return;

  const isFn = typeof str === 'function';

  if (state.isCreating) {
    const node = document.createTextNode('_');

    state.root!.appendChild(node);

    if (isFn) {
      state.path += 'fbp';

      if (isSignal(str)) {
        str.subscribe((v) => (node.textContent = v));
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
    const node = state.pathStack[0].node;
    next();

    if (isSignal(str)) {
      str.subscribe((v) => ((node as any).textContent = v));
      return;
    }

    (node as any).textContent = str();

    return;
  }
}
