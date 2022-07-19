import { pop, push, next, state } from '../state/state';

export function tag(tag: string, fn?: () => any) {
  if (state.isCreating) {
    if (!state.root) return;

    const child = document.createElement(tag);

    state.root.appendChild(child);

    push(child);
    state.path += 'f';

    if (fn) {
      state.path += 's';
      fn && fn();
      state.path += 'e';
    }

    state.path += 'p';
    pop();

    return;
  }

  next(fn);

  return;
}
