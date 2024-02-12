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

export function setAttribute(element: Element, key: string, value: AttrValue) {
  if (value === true || value === '') {
    value = '';
  } else if (!value) {
    element.removeAttribute(key);
    return;
  }

  element.setAttribute(key, value);
}
