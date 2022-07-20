import { isSignal } from 'spred';
import { addSub } from '../dom/dom';
import { next, state } from '../state/state';

export function attr(key: string, value: string | (() => string)) {
  if (state.isCreating && !state.root) return;

  const isFn = typeof value === 'function';

  if (!isFn) {
    if (!state.isCreating) return;
    (state.root as HTMLElement).setAttribute(key, value);
    return;
  }

  let node: HTMLElement;

  if (state.isCreating) {
    node = state.root! as HTMLElement;
    state.path += 'b';
  } else {
    next();
    node = state.pathState.node! as HTMLElement;
  }

  if (isSignal(value)) {
    addSub(
      node,
      value.subscribe((v) => node.setAttribute(key, v))
    );
    return;
  }

  node.setAttribute(key, value());
}
