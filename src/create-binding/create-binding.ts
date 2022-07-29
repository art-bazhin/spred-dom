import { createMark } from '../dom/dom';
import { BINDING, FIRST_CHILD, next, PARENT_NODE, state } from '../state/state';

export function createBinding(cb: (mark: Node) => any) {
  if (state.isCreating) {
    const mark = createMark();

    state.path += FIRST_CHILD + BINDING + PARENT_NODE;
    state.root!.appendChild(mark);

    cb(mark);

    return;
  }

  next();

  const pathState = state.pathState;
  const mark = pathState && pathState.node!;

  cb(mark);

  next();
}
