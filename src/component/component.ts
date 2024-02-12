import { isolate } from '@spred/core';
import { FIRST_CHILD, NEXT_SIBLING, PARENT_NODE, state } from '../state/state';
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

  const prevNode = state.node;
  let root: Node = document.createDocumentFragment();
  state.node = root;

  const prevIsCreating = state.creating;
  state.creating = true;

  isolate(fn, args);

  let path = state.path
    .replace(NEXT_SIBLING_REGEX, NEXT_SIBLING)
    .replace(PARENT_NODE_REGEX, '');

  state.creating = prevIsCreating;
  state.path = prevPath;
  state.node = prevNode;

  if (
    root.childNodes.length === 1 &&
    root.firstChild!.nodeType !== Node.COMMENT_NODE
  ) {
    root = root.firstChild!;
    path = '_' + path.substring(1);
  }

  return { root, path };
}

const NEXT_SIBLING_REGEX = new RegExp(PARENT_NODE + FIRST_CHILD, 'g');
const PARENT_NODE_REGEX = new RegExp(PARENT_NODE, 'g');
