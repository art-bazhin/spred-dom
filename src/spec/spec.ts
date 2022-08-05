import { check, isSignal, memo } from 'spred';
import { AttrValue, setupAttr, setupSignalProp } from '../dom/dom';
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
    P,
    never
  >;
}[keyof T];

interface Attrs {
  [attr: string]: AttrValue | (() => AttrValue);
}

type ElProps<Element extends HTMLElement> = {
  [key in WritableKeys<Element>]?: Element[key] | (() => Element[key]);
};

export type Props<Element extends HTMLElement> = ElProps<Element> & {
  attrs?: Attrs;
  class?: AttrValue | (() => AttrValue);
  text?: string | (() => string);
  ref?: (el: Element) => any;
};

export function spec<Element extends HTMLElement>(props?: Props<Element>) {
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
    const reserved = RESERVED[key];
    let value = (props as any)[key];

    if (reserved) {
      const result = reserved(node, value);
      if (result) hasBindings = true;
      continue;
    }

    key = ALIASES[key] || key;

    if (typeof value === 'function') {
      hasBindings = true;

      if (key[0] === 'o' && key[1] === 'n') {
        (node as any)[key] = value;
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

const RESERVED = {
  attrs(node: Node, attrs: Attrs) {
    let hasBindings = false;

    for (let key in attrs) {
      hasBindings = setupAttr(node, key, attrs[key]) || hasBindings;
    }

    return hasBindings;
  },

  class(node: Node, value: any) {
    return setupAttr(node, 'class', value);
  },

  ref(node: Node, cb: any) {
    cb(node);
    return true;
  },
} as any;

const ALIASES = {
  text: 'textContent',
} as any;
