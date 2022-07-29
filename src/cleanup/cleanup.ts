import { createBinding } from '../create-binding/create-binding';
import { addCleanup } from '../dom/dom';

export function cleanup(fn: () => any, ...callbacks: (() => any)[]) {
  if (callbacks.length) {
    callbacks.unshift(fn);
    fn = () => {
      for (let cb of callbacks) cb();
    };
  }

  createBinding((mark) => {
    addCleanup(mark, fn);
  });
}
