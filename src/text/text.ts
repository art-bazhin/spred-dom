import { isSignal, computed, Signal } from '@spred/core';
import { setupSignalProp } from '../dom/dom';
import {
  BINDING,
  FIRST_CHILD,
  next,
  PARENT_NODE,
  creatingState,
  traversalState,
} from '../state/state';

export function text(data: string | Signal<string> | (() => string)) {
  let node: Node | undefined;

  if (creatingState.isCreating) {
    node = document.createTextNode('_');
    creatingState.root!.appendChild(node);
  } else {
    next();
    node = traversalState.node!;
  }

  const isFunction = typeof data === 'function';

  if (isFunction || typeof data === 'object') {
    if (creatingState.isCreating) {
      creatingState.path += FIRST_CHILD + BINDING + PARENT_NODE;
    } else next();

    setupSignalProp(node, 'textContent', isFunction ? computed(data) : data);

    return;
  }

  if (creatingState.isCreating) {
    creatingState.path += FIRST_CHILD + PARENT_NODE;
    node.textContent = data;
  }
}
