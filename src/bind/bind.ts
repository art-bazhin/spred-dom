import { watch } from 'spred';
import { createBinding } from '../create-binding/create-binding';
import { addCleanup } from '../dom/dom';

export function bind(fn: () => any) {
  createBinding((mark) => {
    addCleanup(mark, watch(fn));
  });
}
