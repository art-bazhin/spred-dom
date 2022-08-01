import { check, isSignal, memo } from 'spred';
import { setupSignalProp } from '../dom/dom';
import { BINDING, next, state } from '../state/state';

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

interface Attrs {
  [attr: string]: string | boolean | (() => string | boolean);
}

type Props<Element extends HTMLElement> = {
  [key in WritableKeys<Element>]?: Element[key] | (() => Element[key]);
};

export type PropsWithAttrs<Element extends HTMLElement> = Props<Element> & {
  attrs?: Attrs;
};

export function spec<Element extends HTMLElement>(
  props?: PropsWithAttrs<Element>
) {
  if (!props || (state.isCreating && !state.root)) return;

  let node: Element;
  let hasBindings = false;

  if (state.isCreating) {
    node = state.root! as Element;
  } else {
    const s = state.pathState;

    if (s.path[s.i + 1] !== BINDING) return;

    next();
    node = state.pathState.node! as Element;
  }

  for (let key in props) {
    let value = (props as any)[key];

    if (key === 'attrs') {
      setupAttrs(node, value);
      continue;
    }

    if (typeof value === 'function') {
      hasBindings = true;

      if (key.substring(0, 2) == 'on') {
        setupEvent(node, key.substring(2), value);
        continue;
      }

      if (isSignal(value)) {
        setupSignalProp(node, key, value);
        continue;
      }

      let v: any;

      const hasSignalCalls = check(() => {
        v = value();
      });

      if (hasSignalCalls) {
        setupSignalProp(node, key, memo(value));
        continue;
      }

      (node as any)[key] = v;

      continue;
    }

    if (state.isCreating) (node as any)[key] = value;
  }

  if (hasBindings && state.isCreating) {
    state.path += BINDING;
  }
}

function setupEvent(node: any, event: string, listener: () => any) {
  if (isSignal(listener)) {
    listener.subscribe((v) => {
      (node as any)['$$' + event] = v;
    });
    delegate(event);
    return;
  }

  (node as any)['$$' + event] = listener;
  delegate(event);
}

function setupAttrs(node: Node, attrs: Attrs) {
  for (let key in attrs) {
  }
}

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

const EVENTS = {} as any;
