import { Signal } from 'spred';

type HTMLTagName = keyof HTMLElementTagNameMap;
type SVGTagName = keyof SVGElementTagNameMap;

type TagElement<T> = T extends HTMLTagName
  ? HTMLElementTagNameMap[T]
  : T extends SVGTagName
  ? SVGElementTagNameMap[T]
  : Element;

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

interface StaticAttrs {
  [key: string]: string | number | boolean | null | undefined;
}

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
  static?: StaticAttrs;
};

interface TemplateNode {
  tag: string;
  props: Props<any>;
  children: Child[];
}

type ChildValue = string | number | boolean | null | undefined | Node;

type Child = ChildValue | (() => ChildValue) | TemplateNode;

export function createTemplateNode<T extends HTMLTagName>(
  tag: T,
  props?: HTMLElementTagNameMap[T],
  children?: Child[]
): TemplateNode;

export function createTemplateNode<T extends SVGTagName>(
  tag: T,
  props?: SVGElementTagNameMap[T],
  children?: Child[]
): TemplateNode;

export function createTemplateNode<T extends string>(
  tag: T,
  props?: Props<TagElement<T>>,
  children?: Child[]
): TemplateNode;

export function createTemplateNode(
  tag: HTMLTagName,
  children?: Child[]
): TemplateNode;

export function createTemplateNode(
  tag: SVGTagName,
  children?: Child[]
): TemplateNode;

export function createTemplateNode(
  tag: string,
  children?: Child[]
): TemplateNode;

export function createTemplateNode(children: Child[]): TemplateNode;

export function createTemplateNode(first: any, second?: any, third?: any) {
  if (Array.isArray(first))
    return {
      children: third,
    };

  if (Array.isArray(second)) {
    return {
      tag: first,
      children: second,
    };
  }

  return {
    tag: first,
    props: second,
    children: third,
  };
}
