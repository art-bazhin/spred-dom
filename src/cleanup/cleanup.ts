import { createBinding } from '../create-binding/create-binding';
import { addCleanup } from '../dom/dom';

export function cleanup(fn: () => any) {
  createBinding((mark) => {
    addCleanup(mark, fn);
  });
}
