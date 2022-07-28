import { isSignal } from 'spred';
import { addSub } from '../dom/dom';
import { BINDING, next, state } from '../state/state';

export function prop(key: string, value: unknown | (() => unknown)) {
  if ((state.isCreating && !state.root) || (key[0] === 'o' && key[1] === 'n'))
    return;

  const isFn = typeof value === 'function';

  if (!isFn) {
    if (!state.isCreating) return;
    (state.root as any)[key] = value;
    return;
  }

  let node: any;

  if (state.isCreating) {
    node = state.root!;
    state.path += BINDING;
  } else {
    next();
    node = state.pathState.node!;
  }

  if (isSignal(value)) {
    addSub(
      node,
      value.subscribe((v) => (node[key] = v))
    );
    return;
  }

  node[key] = value();
}
