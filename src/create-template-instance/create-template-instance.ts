import { isSignal } from 'spred';
import { ATTR_PART, EVENT_PART, PROP_PART } from '../constants/constants';
import { createNode, getChildValueType, isDOMNode, NODE } from '../dom/dom';
import { getTemplate } from '../template/template';

export function html(strings: TemplateStringsArray, ...values: unknown[]) {
  return createTemplateInstance(strings, values, false);
}

export function svg(strings: TemplateStringsArray, ...values: unknown[]) {
  return createTemplateInstance(strings, values, true);
}

function createTemplateInstance(
  strings: TemplateStringsArray,
  values: unknown[],
  isSVG: boolean
) {
  const template = getTemplate(strings, isSVG);

  const parts = template.parts;
  const fragment = template.fragment.cloneNode(true);
  const nodes = parts.map((part) =>
    getNodeFromPosition(part.position, fragment)
  );

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const node = nodes[i];
    const value = values[i];

    switch (part.type) {
      case EVENT_PART:
      case PROP_PART:
        processPropOrAttr(true, part.name!, value, node as Element);
        break;
      case ATTR_PART:
        processPropOrAttr(false, part.name!, value, node as Element);
        break;
      default:
        processNodePart(value, node);
    }
  }

  return fragment;
}

function processNodePart(signalOrValue: unknown, mark: Node) {
  if (!isSignal(signalOrValue))
    return processNodePartValue(signalOrValue, mark);

  const cleanup = getCleanupArray(mark);

  cleanup.push(
    signalOrValue.subscribe((value, prevValue, isFirst) => {
      if (isFirst) {
        processNodePartValue(value, mark);
        return;
      }

      const type = getChildValueType(value);
      const prevType = getChildValueType(prevValue);
      const isTypeChanged = type !== prevType;

      const t = isTypeChanged ? NODE : type;

      switch (t) {
        case NODE:
          return;
        default:
          mark.previousSibling!.textContent = value as any;
          return;
      }
    })
  );
}

function processNodePartValue(value: unknown, mark: Node) {
  const arr = Array.isArray(value) ? value : [value];
  const parent = mark.parentNode!;

  for (let v of arr) {
    parent.insertBefore(createNode(v), mark);
  }
}

function getNodeFromPosition(
  position: number[],
  parent: Node,
  level = 0
): Node {
  const child = parent.childNodes[position[level]];

  if (position.length - 1 === level) return child;
  return getNodeFromPosition(position, child, level + 1);
}

function processPropOrAttr(
  isProp: boolean,
  name: string,
  value: any,
  node: Element
) {
  const fn = isProp ? processPropValue : processAttrValue;

  if (!isSignal(value)) return fn(name, value, node);

  const cleanup = getCleanupArray(node);
  cleanup.push(value.subscribe((v) => fn(name, v, node)));
}

function processPropValue(name: string, value: any, node: Element) {
  (node as any)[name] = value;
}

function processAttrValue(attr: string, value: any, node: Element) {
  switch (value) {
    case true:
      return node.setAttribute(attr, '');
    case false:
    case null:
    case undefined:
      return node.removeAttribute(attr);
    default:
      node.setAttribute(attr, value as string);
  }
}

function getCleanupArray(node: Node): (() => any)[] {
  if (!(node as any)._cleanup) {
    (node as any)._cleanup = [];
  }

  return (node as any)._cleanup;
}
