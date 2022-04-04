import { isSignal } from 'spred';
import { ATTR_PART, EVENT_PART, PROP_PART } from '../constants/constants';
import {
  createNode,
  getChildValueType,
  isDOMNode,
  isFragmentNode,
  NODE,
} from '../dom/dom';
import {
  createSVGTemplateNode,
  createTemplateNode,
  TemplateNode,
} from '../template-node/template-node';
import {
  createTemplateResult,
  TemplateResult,
} from '../template-result/template-result';
import { getTemplate } from '../template/template';

export function html(
  templateFn: (t: typeof createTemplateNode) => TemplateNode
) {
  const node = templateFn(createTemplateNode);
  const result = createTemplateResult(node);

  return createTemplateInstance(result);
}

export function svg(
  templateFn: (t: typeof createSVGTemplateNode) => TemplateNode
) {
  const node = templateFn(createSVGTemplateNode);
  const result = createTemplateResult(node, true);

  return createTemplateInstance(result);
}

function createTemplateInstance(result: TemplateResult) {
  const { str, values, isSVG } = result;
  const template = getTemplate(str, isSVG);
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

export function processNodePart(signalOrValue: unknown, mark: Node) {
  if (!isSignal(signalOrValue)) {
    const value =
      typeof signalOrValue === 'function' ? signalOrValue() : signalOrValue;
    return processNodePartValue(value, mark);
  }

  const cleanup = getCleanupArray(mark);

  let start: any;

  cleanup.push(
    signalOrValue.subscribe((value, prevValue, isFirst) => {
      if (isFirst) {
        start = processNodePartValue(value, mark);
        return;
      }

      const type = getChildValueType(value);
      const prevType = getChildValueType(prevValue);
      const isTypeChanged = type !== prevType;

      if (type !== NODE && !isTypeChanged) {
        mark.previousSibling!.textContent = value as any;
        return;
      }

      removeNodes(start, mark);
      start = processNodePartValue(value, mark);
    })
  );
}

function processNodePartValue(value: unknown, mark: Node) {
  const node = createNode(value);
  const parent = mark.parentNode!;
  const start = isFragmentNode(node) ? node.firstChild : node;

  parent.insertBefore(node, mark);

  return start;
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
  value: unknown,
  node: Element
) {
  const fn = isProp ? processPropValue : processAttrValue;

  if (isSignal(value)) {
    const cleanup = getCleanupArray(node);
    cleanup.push(value.subscribe((v) => fn(name, v, node)));
    return;
  }

  if (!isProp && typeof value === 'function') {
    return fn(name, value(), node);
  }

  return fn(name, value, node);
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

function cleanupNode(node: Node) {
  const arr = (node as any)._cleanup;

  if (arr) for (let fn of arr) fn();
  node.childNodes.forEach(cleanupNode);
}

function removeNodes(start: Node, end: Node) {
  const parent = start.parentNode!;

  let current = start;
  let next = start;

  while (current !== end) {
    cleanupNode(current);
    next = current.nextSibling!;
    parent.removeChild(current);
    current = next;
  }
}
