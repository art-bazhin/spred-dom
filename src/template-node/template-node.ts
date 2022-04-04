import { Signal } from 'spred';

type HTMLTagName = keyof HTMLElementTagNameMap;
type SVGTagName = keyof SVGElementTagNameMap;

type TagElement<T> = T extends HTMLTagName ? HTMLElementTagNameMap[T] : Element;

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
    | (() => string | number | boolean | null | undefined);
}

type Props<E extends Node> = {
  [key in keyof E]?: Prop<E[key]>;
} & {
  attrs?: Attrs;
};

export interface TemplateNode {
  tag?: string;
  props?: Props<any>;
  children?: Child[];
}

type ChildValue = string | number | boolean | null | undefined | Node;

export type Child = ChildValue | (() => ChildValue) | TemplateNode;

const VOID_HTML_TAGS = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
] as const;

type VoidHTMLTagName = typeof VOID_HTML_TAGS[number];

export const VOID_HTML_TAGS_MAP = VOID_HTML_TAGS.reduce((acc, cur) => {
  acc[cur] = true;
  return acc;
}, {} as { [key: string]: boolean });

export function createTemplateNode<T extends HTMLTagName>(
  tag: T,
  props: Props<TagElement<T>>
): TemplateNode;

export function createTemplateNode<T extends HTMLTagName>(
  tag: Exclude<T, VoidHTMLTagName>,
  props: Props<TagElement<T>>,
  children: Child[]
): TemplateNode;

export function createTemplateNode(tag: HTMLTagName): TemplateNode;

export function createTemplateNode(
  tag: Exclude<HTMLTagName, VoidHTMLTagName>,
  children: Child[]
): TemplateNode;

export function createTemplateNode(children: Child[]): TemplateNode;

export function createTemplateNode(first: any, second?: any, third?: any) {
  if (Array.isArray(first))
    return {
      children: first,
      _node: true,
    };

  if (Array.isArray(second)) {
    return {
      tag: first,
      children: second,
      _node: true,
    };
  }

  return {
    tag: first,
    props: second,
    children: third,
    _node: true,
  };
}

export function createSVGTemplateNode<T extends SVGTagName>(
  tag: T,
  props: Props<SVGElementTagNameMap[T]>,
  children?: Child[]
): TemplateNode;

export function createSVGTemplateNode(
  tag: SVGTagName,
  children?: Child[]
): TemplateNode;

export function createSVGTemplateNode(children: Child[]): TemplateNode;

export function createSVGTemplateNode(first: any, second?: any, third?: any) {
  return createTemplateNode(first, second, third);
}

export function isTemplateNode(value: any): value is TemplateNode {
  return value && value._node;
}
