import { check } from 'spred';
import { isSignal, memo } from 'spred';
import { setupSignalProp } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

export function text(data: string | (() => string)) {
  let node: Node | undefined;

  if (state.isCreating) {
    node = document.createTextNode('_');
    state.root!.appendChild(node);
  } else {
    next();
    node = state.pathState.node!;
  }

  if (typeof data === 'function') {
    if (state.isCreating) {
      state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    } else next();

    if (isSignal(data)) {
      setupSignalProp(node, 'textContent', data);
      return;
    }

    let value: any;

    const hasSignalCalls = check(() => {
      value = (data as any)();
    });

    if (hasSignalCalls) {
      setupSignalProp(node, 'textContent', memo(data));
      return;
    }

    node.textContent = value;

    return;
  }

  if (state.isCreating) {
    state.path += FIRST_CHILD + PARENT_NODE;
    node.textContent = data;
  }
}
