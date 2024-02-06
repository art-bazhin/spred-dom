import { isolate } from '@spred/core';
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
import { TemplateResult } from '../template-result/template-result';

export function component<A extends unknown[], N extends Node>(
  fn: (...args: A) => TemplateResult<N>,
) {
  let template: Node | null = null;
  let path = '';

  return function (...args: A): N {
    if (!template) {
      const prevSetupQueue = state.setupQueue;
      state.setupQueue = [];

      const data = createComponentData(fn, args);

      path = data.path;
      template = data.root.cloneNode(true);

      for (let fn of state.setupQueue) fn();

      state.setupQueue = prevSetupQueue;

      return data.root as N;
    }

    const rootNode = template.cloneNode(true) as N;
    setupComponent(fn, args, rootNode, path);

    return rootNode;
  };
}

export function template<A extends unknown[]>(component: (...args: A) => Node) {
  return (...args: A) => node(component(...args));
}

function setupComponent<A extends unknown[]>(
  fn: (...args: A) => any,
  args: A,
  container: Node,
  path: string,
) {
  const prevIsCreating = state.creating;
  const prevPath = state.path;
  const prevIndex = state.i;
  const prevNode = state.node;

  state.creating = false;
  state.path = path;
  state.i = 0;
  state.node = container;

  isolate(fn, args);

  state.creating = prevIsCreating;
  state.path = prevPath;
  state.i = prevIndex;
  state.node = prevNode;
}

function createComponentData<A extends unknown[]>(
  fn: (...args: A) => any,
  args: A,
) {
  const prevPath = state.path;
  state.path = '';

  const prevRoot = state.root;
  let root: Node = document.createDocumentFragment();
  state.root = root;

  const prevIsCreating = state.creating;
  state.creating = true;

  isolate(fn, args);

  let path = getPathString(state.path);

  state.creating = prevIsCreating;
  state.path = prevPath;
  state.root = prevRoot;

  if (root.childNodes.length === 1 && !isMark(root.firstChild)) {
    root = root.firstChild!;
    if (path[0] === FIRST_CHILD) path = '_' + path.substring(1);
  }

  return { root, path };
}

const NEXT_SIBLING_REGEX = new RegExp(PARENT_NODE + FIRST_CHILD, 'g');
const EMPTY_NESTING_REGEX = new RegExp(
  `${START_CHILDREN}[^${BINDING}${START_CHILDREN}${END_CHILDREN}]*${END_CHILDREN}`,
  'g',
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
