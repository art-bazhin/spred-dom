import { isSignal } from 'spred';
import { next, state } from '../state/state';

export function attr(key: string, value: string | (() => string)) {
  if (state.isCreating && !state.root) return;

  const isFn = typeof value === 'function';

  if (!isFn) {
    if (!state.isCreating) return;
    (state.root as HTMLElement).setAttribute(key, value);
    return;
  }

  if (state.isCreating) {
    const node = state.root;

    state.path += 'b';

    if (isSignal(value)) {
      value.subscribe((v) => (node as HTMLElement).setAttribute(key, v));
      return;
    }

    (node as HTMLElement).setAttribute(key, value());

    return;
  }

  next();

  const node = state.pathState.node;

  if (isSignal(value)) {
    value.subscribe((v) => (node as HTMLElement).setAttribute(key, v));
    return;
  }

  (node as HTMLElement).setAttribute(key, value());
}
