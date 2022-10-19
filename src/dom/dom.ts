import { isSignal, computed, Signal } from 'spred';
import { creatingState } from '../state/state';

export type Falsy = null | undefined | false | 0 | '';
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

export function isFragment(node: Node): node is DocumentFragment {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}

export function createMark() {
  return document.createTextNode('');
}

export function isMark(node: Node | null) {
  return node && node.nodeType === Node.TEXT_NODE && !node.textContent;
}

export function setupSignalProp(node: Node, key: string, signal: Signal<any>) {
  signal.subscribe((value) => ((node as any)[key] = value));
}

export function setupAttr(
  node: Node,
  key: string,
  value: AttrValue | (() => AttrValue)
) {
  if (typeof value === 'function') {
    setupSignalAttr(node, key, isSignal(value) ? value : computed(value));
    return true;
  }

  if (creatingState.isCreating) setupBaseAttr(node, key, value);
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
  value: Signal<AttrValue>
) {
  value.subscribe((v) => setupBaseAttr(node, key, v));
}
