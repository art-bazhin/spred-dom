import { isMark } from '../dom/dom';
import { node } from '../node/node';
import { state } from '../state/state';

export function createComponent<A extends unknown[]>(fn: (...args: A) => any) {
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

export function createComponentFn<A extends unknown[]>(
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

  fn(...args);

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

  fn(...args);

  let pathString = getPathString(state.path);

  state.isCreating = tempIsCreating;
  state.path = tempPath;
  state.root = tempRoot;

  if (rootNode.childNodes.length === 1 && !isMark(rootNode.firstChild)) {
    rootNode = rootNode.firstChild!;
    if (pathString[0] === 'f') pathString = '_' + pathString.substring(1);
  }

  return { rootNode, pathString };
}

function getPathString(str: string) {
  let pathString = str
    .replace(/pf/g, 'n')
    .replace(/p(b+)f/g, (_, str) => {
      return 'p' + str + 'l';
    })
    .replace(/pb/g, 'xb');

  let temp = '';

  while (temp !== pathString) {
    temp = pathString;
    pathString = pathString
      .replace(/^([^bse]*)$/g, '')
      .replace(/s([^bse]*)e/g, '');
  }

  pathString = pathString
    .replace(/f(n*)p/g, (str) => {
      return 'r'.repeat(str.length - 1);
    })
    .replace(/(n+)p/g, (str) => {
      return 'r'.repeat(str.length - 1) + 'p';
    })
    .replace(/e/g, '')
    .replace(/x/g, 'p')
    .replace(/([rp]+)$/g, '');

  return pathString;
}
