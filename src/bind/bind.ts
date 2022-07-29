import { watch } from 'spred';
import { createBinding } from '../create-binding/create-binding';
import { addSub } from '../dom/dom';

export function bind(fn: () => any) {
  createBinding((mark) => {
    addSub(mark, watch(fn));
  });
}
