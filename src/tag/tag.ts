import { next, state } from '../state/state';
import { spec } from '../spec/spec';

export function tag<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  fn?: (specFn: typeof spec<HTMLElementTagNameMap[TagName]>) => any
) {
  if (state.isCreating) {
    if (!state.root) return;

    const child = document.createElement(tag);

    state.root.appendChild(child);

    state.root = child;
    state.path += 'f';

    if (fn) {
      state.path += 's';
      fn && fn(spec);
      state.path += 'e';
    }

    state.path += 'p';
    state.root = state.root!.parentNode;

    return;
  }

  next(fn);

  return;
}
