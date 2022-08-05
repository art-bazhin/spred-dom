import { createMark } from '../dom/dom';
import {
  BINDING,
  FIRST_CHILD,
  next,
  PARENT_NODE,
  creatingState,
  traversalState,
} from '../state/state';

export function createBinding(cb: (mark: Node) => any) {
  if (creatingState.isCreating) {
    const mark = createMark();

    creatingState.path += FIRST_CHILD + BINDING + PARENT_NODE;
    creatingState.root!.appendChild(mark);

    cb(mark);

    return;
  }

  next();

  const mark = traversalState && traversalState.node!;

  cb(mark);

  next();
}
