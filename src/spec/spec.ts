import { check, isSignal, memo } from 'spred';
import { setupAttr, setupSignalProp } from '../dom/dom';
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
  [attr: string]:
    | string
    | boolean
    | null
    | undefined
    | (() => string | boolean | null | undefined);
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
    const reserved = RESERVED_PROPS[key];
    let value = (props as any)[key];

    if (reserved) {
      reserved(node, value);
      continue;
    }

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

const RESERVED_PROPS = {
  attrs(node: Node, attrs: Attrs) {
    for (let key in attrs) {
      setupAttr(node, key, attrs[key]);
    }
  },
} as any;
