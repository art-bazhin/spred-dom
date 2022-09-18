import { isolate } from 'spred';
import { isMark } from '../dom/dom';
import { node } from '../node/node';
import { SSRPart, ssrState } from '../ssr/ssr';
import {
  BINDING,
  START_CHILDREN,
  END_CHILDREN,
  FIRST_CHILD,
  NEXT_SIBLING,
  PARENT_NODE,
  creatingState,
  traversalState,
} from '../state/state';
import { TemplateResult } from '../template-result/template-result';

export function component<A extends unknown[], N extends Node>(
  fn: (...args: A) => TemplateResult<N>
) {
  let template: Node | null = null;
  let ssrTemplate: ((...args: A) => string) | null = null;
  let pathString = '';

  return function (...args: A): N {
    if (ssrState.ssr) {
      if (!ssrTemplate) ssrTemplate = ssrState.createTemplate(fn, args);
      return ssrTemplate(...args) as any;
    }

    if (!template) {
      const prevSetupQueue = creatingState.setupQueue;
      creatingState.setupQueue = [];

      const data = createComponentData(fn, args);

      pathString = data.pathString;
      template = data.rootNode.cloneNode(true);

      for (let fn of creatingState.setupQueue) fn();

      creatingState.setupQueue = prevSetupQueue;

      return data.rootNode as N;
    }

    const rootNode = template.cloneNode(true) as N;
    setupComponent(fn, args, rootNode, pathString);

    return rootNode;
  };
}

export function templateFn<A extends unknown[]>(
  component: (...args: A) => Node
) {
  return (...args: A) => node(component(...args));
}

function setupComponent<A extends unknown[]>(
  fn: (...args: A) => any,
  args: A,
  container: Node,
  pathString: string
) {
  const prevIsCreating = creatingState.isCreating;
  const prevPath = traversalState.path;
  const prevIndex = traversalState.i;
  const prevNode = traversalState.node;

  creatingState.isCreating = false;
  traversalState.path = pathString;
  traversalState.i = 0;
  traversalState.node = container;

  isolate(fn, args);

  creatingState.isCreating = prevIsCreating;
  traversalState.path = prevPath;
  traversalState.i = prevIndex;
  traversalState.node = prevNode;
}

function createComponentData<A extends unknown[]>(
  fn: (...args: A) => any,
  args: A
) {
  const prevPath = creatingState.path;
  creatingState.path = '';

  const prevRoot = creatingState.root;
  let rootNode: Node = document.createDocumentFragment();
  creatingState.root = rootNode;

  const prevIsCreating = creatingState.isCreating;
  creatingState.isCreating = true;

  isolate(fn, args);

  let pathString = getPathString(creatingState.path);

  creatingState.isCreating = prevIsCreating;
  creatingState.path = prevPath;
  creatingState.root = prevRoot;

  if (rootNode.childNodes.length === 1 && !isMark(rootNode.firstChild)) {
    rootNode = rootNode.firstChild!;
    if (pathString[0] === FIRST_CHILD)
      pathString = '_' + pathString.substring(1);
  }

  return { rootNode, pathString };
}

const NEXT_SIBLING_REGEX = new RegExp(PARENT_NODE + FIRST_CHILD, 'g');
const EMPTY_NESTING_REGEX = new RegExp(
  `${START_CHILDREN}[^${BINDING}${START_CHILDREN}${END_CHILDREN}]*${END_CHILDREN}`,
  'g'
);
const END_CHILDREN_REGEX = new RegExp(END_CHILDREN, 'g');
const EMPTY_TAIL = new RegExp(`[^${BINDING}]+$`, 'g');
const PARENT_NODE_REGEX = new RegExp(`${NEXT_SIBLING}+${PARENT_NODE}`, 'g');

function getPathString(str: string) {
  str = str.replace(NEXT_SIBLING_REGEX, NEXT_SIBLING);

  let prev = '';

  while (prev !== str) {
    prev = str;
    str = str.replace(EMPTY_NESTING_REGEX, '');
  }

  str = str
    .replace(EMPTY_TAIL, '')
    .replace(END_CHILDREN_REGEX, '')
    .replace(PARENT_NODE_REGEX, PARENT_NODE);

  return str;
}
