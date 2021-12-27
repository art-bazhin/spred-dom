import { Signal } from 'spred';
import { toCamelCase } from '../utils/to-camel-case';

const ATTR_MAP: {
  [key: string]: string;
} = {
  className: 'class',
  target: 'target',
  href: 'href',
};

export const TEXT = 1;
export const FALSY = 2;
export const NODE = 3;

export type ChildValue = string | number | boolean | null | undefined | Node;
export type Child = ChildValue | Signal<ChildValue>;
export type Children = Child[];

export function isFragment(el: any): el is DocumentFragment {
  return el.nodeType === 11;
}

export function isFragmentStartMark(el: any) {
  return el._end as Comment | undefined;
}

export function markFragment(fragment: DocumentFragment) {
  if ((fragment as any)._marked) return fragment.firstChild!;

  const start = document.createComment('fragment-start');
  const end = document.createComment('fragment-end');

  (start as any)._end = end;
  (end as any)._start = start;
  (fragment as any)._marked = 1;

  fragment.appendChild(end);
  fragment.insertBefore(start, fragment.firstChild);

  return start;
}

export function createNode(child: ChildValue, type?: number) {
  const t = type || getChildValueType(child);

  switch (t) {
    case TEXT:
      return document.createTextNode(child + '');
    case FALSY:
      return document.createComment(child + '');
  }

  return child as Node;
}

export function replaceChild(parent: Node, child: Node, refNode?: Node) {
  let current = child;

  if (isFragmentStartMark(child)) {
    const end = (child as any)._end as Comment;
    let next: Node;

    while (current !== end) {
      next = current.nextSibling!;

      if (refNode) parent.insertBefore(current, refNode);
      else parent.removeChild(current);

      current = next;
    }
  }

  if (refNode) parent.insertBefore(current, refNode);
  else parent.removeChild(current);
}

export function processChild(child: Child) {
  let res: Node;

  if (child && (child as any).subscribe) {
    res = processAtomChild(child as any);
  } else {
    res = createNode(child as any);
  }

  return res;
}

export function processProp(
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

function getChildValueType(child: ChildValue) {
  const t = typeof child;

  if (t === 'string' || t === 'number' || child === true) {
    return TEXT;
  }

  if (!child) return FALSY;

  return NODE;
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

function processAtomChild(signal: Signal<ChildValue>) {
  let node: Node;

  const cleanup = signal.subscribe((value, prevValue, firstRun) => {
    if (firstRun) {
      node = createNode(value);
      return;
    }

    const type = getChildValueType(value);
    const prevType = getChildValueType(prevValue);
    const isTypeChanged = type !== prevType;
    const t = isTypeChanged ? NODE : type;

    switch (t) {
      case NODE: {
        const newNode = createNode(value, type);
        const markNode = isFragment(newNode) ? markFragment(newNode) : newNode;
        const parent = node.parentNode!;

        cleanupNodeProps(node);
        cleanupFragment(node);
        node.childNodes.forEach(cleanupNode);

        parent.insertBefore(newNode, node);
        replaceChild(parent, node);

        node = markNode;
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

export function clearElement(element: Element) {
  cleanupNode(element);
  element.innerHTML = '';
}

export function cleanupNode(node: Node) {
  const cleanup = (node as any)._cleanup;
  if (cleanup) cleanup();

  cleanupNodeProps(node);

  node.childNodes.forEach(cleanupNode);
}

export function cleanupFragment(startNode: Node) {
  const end = isFragmentStartMark(startNode);

  if (!end) return;

  let current: Node = startNode.nextSibling!;
  let next: Node;

  while (current !== end) {
    next = current.nextSibling!;
    cleanupNode(current);
    current = next;
  }
}

function cleanupNodeProps(node: Node) {
  const propsCleanup = (node as any)._propsCleanup;
  if (propsCleanup) propsCleanup.forEach((fn: any) => fn());
}
