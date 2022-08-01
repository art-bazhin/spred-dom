import { Signal } from 'spred';

export function insertBefore(child: Node, mark: Node) {
  const parent = mark.parentNode;

  if (!parent) return;
  parent.insertBefore(child, mark);
}

export function removeNodes(start: Node | null, end: Node | null) {
  if (!start || !end) return;

  const parent = start.parentNode!;

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
