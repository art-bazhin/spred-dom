import { next, state } from '../state/state';

export function tag(tag: string, fn?: () => any) {
  if (state.isCreating) {
    if (!state.root) return;

    const child = document.createElement(tag);

    state.root.appendChild(child);

    state.root = child;
    state.path += 'f';

    if (fn) {
      state.path += 's';
      fn && fn();
      state.path += 'e';
    }

    state.path += 'p';
    state.root = state.root!.parentNode;

    return;
  }

  next(fn);

  return;
}
