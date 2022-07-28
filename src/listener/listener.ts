import { BINDING, next, state } from '../state/state';

export const EVENTS = {} as any;

function eventListener(e: Event) {
  const key = '$$' + e.type;
  let node = e.target as any;

  while (node) {
    const handler = node[key];

    if (handler) {
      handler(e);
      if (e.cancelBubble) return;
    }

    node = node.parentNode;
  }
}

function delegate(event: string) {
  if (EVENTS[event]) return;

  EVENTS[event] = true;

  document.addEventListener(event, eventListener);
}

export function listener(event: string, listener: (...args: any) => any) {
  if (state.isCreating) {
    state.path += BINDING;

    (state.root as any)['$$' + event] = listener;
    delegate(event);

    return;
  }

  next();

  const node = state.pathState.node;

  (node as any)['$$' + event] = listener;

  delegate(event);
}
