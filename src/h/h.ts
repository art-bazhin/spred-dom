import { Signal } from 'spred';

const TEXT = 1;
const FALSY = 2;
const NODE = 3;

export type ChildValue = string | number | boolean | null | undefined | Node;
export type Child = ChildValue | Signal<ChildValue>;

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

type ExcludedProps = never;
// | 'classList'
// | 'addEventListener'
// | 'append'
// | 'appendChild';

const TAGS: {
  [key in TagName]?: HTMLElementTagNameMap[key];
} = {};

function createElement<T extends TagName>(tagName: T) {
  let src = TAGS[tagName];

  if (!src) {
    TAGS[tagName] = document.createElement(tagName) as any;
    src = TAGS[tagName];
  }

  return src!.cloneNode() as HTMLElementTagNameMap[T];
}

export function isFragment(el: any) {
  return el && el.nodeType === 11;
}

export function h<T extends TagName, E extends HTMLElementTagNameMap[T]>(
  tagName: T
): E;

export function h<
  T extends TagName,
  E extends HTMLElementTagNameMap[T],
  K extends keyof E,
  V extends E[K]
>(tagName: T, props: Props<E>): E;

export function h<T extends TagName, E extends HTMLElementTagNameMap[T]>(
  tagName: T,
  children: Child[]
): E;

export function h<
  T extends TagName,
  E extends HTMLElementTagNameMap[T],
  K extends keyof E,
  V extends E[K]
>(tagName: T, props: Props<E>, children: Child[]): E;

export function h<
  T extends TagName,
  E extends HTMLElementTagNameMap[T],
  K extends keyof E,
  V extends E[K]
>(first: any, second?: any, third?: any[]) {
  const tagName: T = first;

  let props: { [key in K]?: Prop<V> } = {};
  let children: Child[] = [];

  if (Array.isArray(second)) {
    children = second;
  } else {
    props = second;
    if (third) children = third;
  }

  const el = createElement(tagName);

  for (let key in props) {
    processProp(el, el, key, props[key]);
  }

  for (let child of children) {
    el.appendChild(processChild(child));
  }

  return el;
}

function processProp(
  element: any,
  target: any,
  key: string,
  value: any,
  isAttr?: boolean
) {
  const attr = getAttr(key, isAttr);

  if (value !== null && typeof value === 'object') {
    const isAttr = key === 'attrs' && element === target;
    const obj = isAttr ? element : element[key];

    for (let k in value) {
      processProp(element, obj, k, value[k], isAttr);
    }

    return;
  }

  if (value && value.subscribe) {
    processAtomProp(element, target, key, value, attr);
  } else {
    processValueProp(element, target, key, value, attr);
  }
}

function processAtomProp(
  element: any,
  obj: any,
  key: string,
  signal: Signal<any>,
  attr?: string
) {
  if (!element._propsCleanup) {
    (element as any)._propsCleanup = [];
  }

  const isModel = key === 'model';

  if (isModel) {
    element._propsCleanup.push(
      signal.subscribe((value) => {
        processValueProp(element, obj, 'value', value);
        processValueProp(element, obj, 'oninput', (e: any) =>
          (signal as any)(e.target.value)
        );
      })
    );

    return;
  }

  element._propsCleanup.push(
    signal.subscribe((value) => {
      processValueProp(element, obj, key, value, attr);
    })
  );
}

const ATTR_MAP: {
  [key: string]: string;
} = {
  className: 'class',
  target: 'target',
  href: 'href',
};

function toCamelCase(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function getAria(key: string) {
  if (key.indexOf('aria') !== 0) return;
  return toCamelCase(key);
}

function getAttr(key: string, isAttr?: boolean) {
  if (isAttr) return toCamelCase(key);
  return ATTR_MAP[key] || getAria(key);
}

function processValueProp(
  el: any,
  obj: any,
  key: string,
  value: any,
  attr?: any
) {
  const isFalsy = value === false || value === null || value === undefined;

  if (attr) {
    if (isFalsy) el.removeAttribute(attr);
    else el.setAttribute(attr, value === true ? '' : value);
    return;
  }

  obj[key] = value;
  if (isFalsy) delete obj[key];
}

function getChildType(child: Child) {
  const t = typeof child;

  if (t === 'string' || t === 'number' || child === true) {
    return TEXT;
  }

  if (!child) return FALSY;

  return NODE;
}

export function createNode(child: Child, type?: number) {
  const t = type || getChildType(child);

  switch (t) {
    case TEXT:
      return document.createTextNode(child + '');
    case FALSY:
      return document.createComment(child + '');
  }

  return child as Node;
}

export function processChild(child: Child | Signal<Child>) {
  let res: Node;

  if (child && (child as any).subscribe) {
    res = processAtomChild(child as any);
  } else {
    res = createNode(child as any);
  }

  return res;
}

function processAtomChild(signal: Signal<Child>) {
  let node: Node;

  const cleanup = signal.subscribe((value, prevValue, firstRun) => {
    if (firstRun) {
      node = createNode(value);
      return;
    }

    const type = getChildType(value);
    const prevType = getChildType(prevValue);
    const isTypeChanged = type !== prevType;
    const t = isTypeChanged ? NODE : type;

    switch (t) {
      case NODE: {
        const newNode = createNode(value, type);
        const parent = node.parentNode!;

        parent.insertBefore(newNode, node);
        parent.removeChild(node);

        cleanupNodeProps(node);
        node.childNodes.forEach(cleanupNode);

        node = newNode;
        (node as any)._cleanup = cleanup;

        return;
      }

      default: {
        node.textContent = value + '';
        return;
      }
    }
  });

  (node! as any)._cleanup = cleanup;

  return node!;
}

export function cleanupNode(node: Node) {
  const cleanup = (node as any)._cleanup;
  if (cleanup) cleanup();

  cleanupNodeProps(node);

  node.childNodes.forEach(cleanupNode);
}

function cleanupNodeProps(node: Node) {
  const propsCleanup = (node as any)._propsCleanup;
  if (propsCleanup) propsCleanup.forEach((fn: any) => fn());
}
