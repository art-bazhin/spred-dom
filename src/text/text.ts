import { isSignal, memo } from 'spred';
import { setupSignalProp } from '../dom/dom';
import {
  BINDING,
  FIRST_CHILD,
  next,
  PARENT_NODE,
  creatingState,
  traversalState,
} from '../state/state';

export function text(data: string | (() => string)) {
  let node: Node | undefined;

  if (creatingState.isCreating) {
    node = document.createTextNode('_');
    creatingState.root!.appendChild(node);
  } else {
    next();
    node = traversalState.node!;
  }

  if (typeof data === 'function') {
    if (creatingState.isCreating) {
      creatingState.path += FIRST_CHILD + BINDING + PARENT_NODE;
    } else next();

    setupSignalProp(node, 'textContent', isSignal(data) ? data : memo(data));

    return;
  }

  if (creatingState.isCreating) {
    creatingState.path += FIRST_CHILD + PARENT_NODE;
    node.textContent = data;
  }
}
