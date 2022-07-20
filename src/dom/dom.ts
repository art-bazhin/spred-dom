const SUBS_KEY = '$subs';

let cleanupQueue: (() => any)[][] = [];

export function insertBefore(child: Node, mark: Node) {
  const parent = mark.parentNode;

  if (!parent) return;
  parent.insertBefore(child, mark);
}

export function removeNodes(start: Node, end: Node) {
  if (!start || !end) return;

  const parent = start.parentNode!;

  let current: Node | null = start;
  let next: Node | null = null;

  while (current && current !== end) {
    addSubsToQueue(current);
    next = current.nextSibling;
    parent.removeChild(current);
    current = next;
  }

  cleanup();
}

export function isFragment(node: Node): node is DocumentFragment {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}

export function addSub(node: Node, sub: () => any) {
  let subs = (node as any)[SUBS_KEY];

  if (!subs) {
    subs = [];
    (node as any)[SUBS_KEY] = subs;
  }

  subs.push(sub);
}

function addSubsToQueue(node: Node) {
  const subs: (() => void)[] = (node as any)[SUBS_KEY];

  let child = node.firstChild;

  while (child) {
    addSubsToQueue(child);
    child = child.nextSibling;
  }

  if (!subs) return;
  cleanupQueue.push(subs);
}

function cleanup() {
  setTimeout(() => {
    for (let arr of cleanupQueue) {
      for (let unsub of arr) unsub();
    }

    cleanupQueue = [];
  });
}
