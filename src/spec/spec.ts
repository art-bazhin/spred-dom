import { isSignal, computed, Signal, WritableSignal } from '@spred/core';
import { ClassMap, ClassName, fromArray, fromObject } from '../classes/classes';
import { AttrValue, setupAttr, setupSignalProp } from '../dom/dom';
import { BINDING, next, state } from '../state/state';

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

interface Attrs {
  [attr: string]: AttrValue | (() => AttrValue) | Signal<AttrValue>;
}

type ElProps<Element extends HTMLElement> = {
  [key in WritableKeys<Element>]?: (() => any) extends Element[key]
    ? Element[key]
    : Element[key] | (() => Element[key]) | Signal<Element[key]>;
};

export type Props<Element extends HTMLElement> = ElProps<Element> & {
  attrs?: Attrs;
  class?:
    | AttrValue
    | (() => AttrValue)
    | Signal<AttrValue>
    | ClassMap
    | ClassName[];
  text?: ElProps<HTMLElement>['textContent'];
  ref?: (el: Element) => any;
};

export function spec<Element extends HTMLElement>(props: Props<Element>) {
  let node = state.node!;
  let hasBindings = false;

  for (let key in props) {
    const reserved = RESERVED[key];
    let value = (props as any)[key];

    if (reserved) {
      if (reserved(node, value)) hasBindings = true;
      continue;
    }

    key = ALIASES[key] || key;

    if (typeof value === 'function') {
      hasBindings = true;

      if (key[0] === 'o' && key[1] === 'n') {
        (node as any)[key] = value;
        continue;
      }

      setupSignalProp(node, key, computed(value));
      continue;
    } else if (typeof value === 'object' && value !== null) {
      hasBindings = true;
      setupSignalProp(node, key, value);
      continue;
    }

    if (state.creating) (node as any)[key] = value;
  }

  if (hasBindings && state.creating) {
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
    if (typeof value === 'object') {
      if (Array.isArray(value)) value = fromArray(value);
      else if (!isSignal(value)) value = fromObject(value);
    }

    return setupAttr(node, 'class', value);
  },

  ref(node: Node, cb: any) {
    cb(node);
    return true;
  },

  value(node: Node, value: any) {
    return setupTwoWayBinding(node, value, (node, value) => {
      node.addEventListener('input', (e: any) => {
        value.set(e.target.value);
      });
    });
  },
} as any;

const ALIASES = {
  text: 'textContent',
} as any;

function setupTwoWayBinding<T extends Node>(
  node: T,
  value: any,
  setupWriteFn: (node: T, value: WritableSignal<any>) => void,
) {
  if (typeof value === 'function') {
    setupSignalProp(node, 'value', computed(value));
    return true;
  } else if (typeof value === 'object' && value !== null) {
    if (value.set) setupWriteFn(node, value);
    setupSignalProp(node, 'value', value);
    return true;
  }

  if (state.creating) (node as any).value = value;

  return false;
}
