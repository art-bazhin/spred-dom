import { isSignal } from 'spred';
import { AttrValue, setupAttr, setupSignalProp } from '../dom/dom';
import { BINDING, next, creatingState, traversalState } from '../state/state';

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

export function spec<Element extends HTMLElement>(
  props?: Props<Element>,
  fn?: () => any
) {
  if (!props || (creatingState.isCreating && !creatingState.root)) return;

  let node: Element;
  let hasBindings = false;

  if (creatingState.isCreating) {
    node = creatingState.root! as Element;
  } else {
    if (traversalState.path[traversalState.i] !== BINDING) return;

    node = traversalState.node! as Element;
    next(fn);
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

      (node as any)[key] = value();

      continue;
    }

    if (creatingState.isCreating) (node as any)[key] = value;
  }

  if (hasBindings && creatingState.isCreating) {
    creatingState.path += BINDING;
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
