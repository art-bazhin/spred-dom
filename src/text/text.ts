import { isSignal, computed, Signal } from '@spred/core';
import { setupSignalProp } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

export function text(data: string | Signal<string> | (() => string)) {
  let node: Node | undefined;

  if (state.creating) {
    node = document.createTextNode('_');
    state.node!.appendChild(node);
  } else {
    next();
    node = state.node!;
  }

  const isFunction = typeof data === 'function';

  if (isFunction || typeof data === 'object') {
    if (state.creating) {
      state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    } else next();

    if (isFunction) node.textContent = data();
    else setupSignalProp(node, 'textContent', data);

    return;
  }

  if (state.creating) {
    state.path += FIRST_CHILD + PARENT_NODE;
    node.textContent = data;
  }
}
