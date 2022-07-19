import { Signal } from 'spred';
import { Component } from '../component/component';
import { insertBefore, removeNodes } from '../dom/dom';
import { mount } from '../mount/mount';
import { next, state } from '../state/state';

export function bind(binding: Signal<Component<void>>) {
  next();

  if (state.isCreating && state.root) {
    state.path += 'fbp';

    const mark = document.createComment('');

    state.setupQueue.push({ mark, binding });

    state.root.appendChild(mark);
    return;
  }

  const pathState = state.pathStack[0];
  const mark = pathState && pathState.node;

  setupBinding(binding, mark);
}

export function setupBinding(
  binding: Signal<Component<void>>,
  mark: Node | null
) {
  if (!mark) return;

  const fragment = document.createDocumentFragment();

  let start: Node | null = null;
  let end: Node | null = null;

  binding.subscribe((res: any) => {
    if (start && end) removeNodes(start, end);

    mount(res, fragment);

    start = fragment.firstChild;
    end = fragment.lastChild;

    insertBefore(fragment, mark);
  });
}
