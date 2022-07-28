import { isSignal } from 'spred';
import { addSub } from '../dom/dom';
import { next, state } from '../state/state';
import { EVENTS } from '../listener/listener';

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

type PropsWithAttrs<Element extends HTMLElement> = Props<Element> & {
  attrs?: Attrs;
};

export function spec<Element extends HTMLElement>(
  props: PropsWithAttrs<Element>
) {
  if (state.isCreating && !state.root) return;

  let node: Element;
  let key: keyof PropsWithAttrs<Element>;
  let hasBindings = false;

  if (state.isCreating) {
    node = state.root! as Element;
  } else {
    next();
    node = state.pathState.node! as Element;
  }

  for (key in props) {
    const value = props[key] as any;

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
        addSub(
          node,
          value.subscribe((v) => ((node as any)[key] = v))
        );
        continue;
      }

      node[key] = value();

      continue;
    }

    if (state.isCreating) node[key] = value;
  }

  if (state.isCreating && hasBindings) {
    state.path += 'b';
  }
}

function setupEvent(node: any, event: string, listener: () => any) {
  if (isSignal(listener)) {
    addSub(
      node,
      listener.subscribe((v) => {
        (node as any)['$$' + event] = v;
      })
    );
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
