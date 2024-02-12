import { computed, Signal } from '@spred/core';
import { state } from '../state/state';

export type Falsy = null | undefined | false;
export type AttrValue = string | true | Falsy;

export function insertBefore(child: Node, mark: Node, parentNode?: Node) {
  const parent = parentNode || mark.parentNode;
  parent!.insertBefore(child, mark);
}

export function removeNodes(start: Node, end: Node, parentNode?: Node) {
  const parent = parentNode || start.parentNode!;

  let current: Node | null = start;
  let next: Node | null = null;

  while (current && current !== end) {
    next = current.nextSibling;
    parent.removeChild(current);
    current = next;
  }
}

export function setupSignalProp(node: Node, key: string, signal: Signal<any>) {
  signal.subscribe((value) => ((node as any)[key] = value));
}

export function setupAttr(
  node: Node,
  key: string,
  value: AttrValue | (() => AttrValue) | Signal<AttrValue>,
) {
  if (typeof value === 'function') {
    setupBaseAttr(node, key, value());
    return true;
  }

  if (typeof value === 'object' && value !== null) {
    setupSignalAttr(node, key, value);
    return true;
  }

  if (state.creating) setupBaseAttr(node, key, value);

  return false;
}

export function setupBaseAttr(node: Node, key: string, value: AttrValue) {
  if (value === true || value === '') {
    value = '';
  } else if (!value) {
    (node as Element).removeAttribute(key);
    return;
  }

  (node as Element).setAttribute(key, value);
}

export function setupSignalAttr(
  node: Node,
  key: string,
  value: Signal<AttrValue>,
) {
  value.subscribe((v) => setupBaseAttr(node, key, v));
}
