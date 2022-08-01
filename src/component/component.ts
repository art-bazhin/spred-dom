import { isolate } from 'spred';
import { isMark } from '../dom/dom';
import { node } from '../node/node';
import {
  BINDING,
  START_CHILDREN,
  END_CHILDREN,
  FIRST_CHILD,
  NEXT_SIBLING,
  PARENT_NODE,
  state,
} from '../state/state';

export function component<A extends unknown[]>(fn: (...args: A) => any) {
  let template: Node | null = null;
  let pathString = '';

  return function (...args: A) {
    let rootNode: Node | null = null;

    if (!template) {
      const prevSetupQueue = state.setupQueue;
      state.setupQueue = [];

      const data = createComponentData(fn, args);

      pathString = data.pathString;
      template = data.rootNode.cloneNode(true);
      rootNode = data.rootNode;

      for (let fn of state.setupQueue) fn();

      state.setupQueue = prevSetupQueue;
    } else {
      rootNode = template.cloneNode(true);
      setupComponent(fn, args, rootNode, pathString);
    }

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
  const tempPath = state.path;
  state.path = '';

  const tempRoot = state.root!;
  state.root = container;

  const tempIsCreating = state.isCreating;
  state.isCreating = false;

  const tempPathState = state.pathState;
  state.pathState = {
    path: pathString,
    i: 0,
    node: container,
  };

  isolate(fn, args);

  state.pathState = tempPathState;
  state.isCreating = tempIsCreating;
  state.path = tempPath;
  state.root = tempRoot;
}

function createComponentData<A extends unknown[]>(
  fn: (...args: A) => any,
  args: A
) {
  const tempPath = state.path;
  state.path = '';

  const tempRoot = state.root;
  let rootNode: Node = document.createDocumentFragment();
  state.root = rootNode;

  const tempIsCreating = state.isCreating;
  state.isCreating = true;

  isolate(fn, args);

  let pathString = getPathString(state.path);

  state.isCreating = tempIsCreating;
  state.path = tempPath;
  state.root = tempRoot;

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

  let temp = '';

  while (temp !== str) {
    temp = str;
    str = str.replace(EMPTY_NESTING_REGEX, '');
  }

  str = str
    .replace(EMPTY_TAIL, '')
    .replace(END_CHILDREN_REGEX, '')
    .replace(PARENT_NODE_REGEX, PARENT_NODE);

  return str;
}
