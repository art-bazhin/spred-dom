import { Signal } from 'spred';
import { Children, markFragment, processChild, processProp } from '../dom/dom';

type TagName = keyof HTMLElementTagNameMap;

type PropValue<V> =
  | V
  | null
  | undefined
  | boolean
  | Signal<V | null | undefined | boolean>;

type Prop<V> =
  | {
      [key in keyof V]?: PropValue<V[key]>;
    }
  | PropValue<V>;

interface Attrs {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Signal<string | number | boolean | null | undefined>;
}

type Props<E extends Node> = {
  [key in keyof E]?: Prop<E[key]>;
} & {
  attrs?: Attrs;
};

type TagElement<T> = T extends TagName ? HTMLElementTagNameMap[T] : Element;

export function h<T extends string, E extends TagElement<T>>(tagName: T): E;

export function h<
  T extends string,
  E extends TagElement<T>,
  K extends keyof E,
  V extends E[K]
>(tagName: T, props: Props<E>): E;

export function h<T extends string, E extends TagElement<T>>(
  tagName: T,
  children: Children
): E;

export function h<
  T extends string,
  E extends TagElement<T>,
  K extends keyof E,
  V extends E[K]
>(tagName: T, props: Props<E>, children: Children): E;

export function h(children: Children): DocumentFragment;

export function h<
  T extends string,
  E extends TagElement<T>,
  K extends keyof E,
  V extends E[K]
>(first: any, second?: any, third?: any[]) {
  const fragmentChildren = Array.isArray(first) && first;

  if (fragmentChildren) {
    const fragment = document.createDocumentFragment();

    for (let child of fragmentChildren) {
      fragment.appendChild(processChild(child));
    }

    markFragment(fragment);

    return fragment;
  }

  const tagName: T = first;

  let props: { [key in K]?: Prop<V> } = {};
  let children: Children = [];

  if (Array.isArray(second)) {
    children = second;
  } else {
    props = second;
    if (third) children = third;
  }

  const el = document.createElement(tagName);

  for (let key in props) {
    processProp(el, el, key, props[key]);
  }

  for (let child of children) {
    el.appendChild(processChild(child));
  }

  return el;
}
