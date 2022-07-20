import { node, setupBinding } from '../node/node';
import { state } from '../state/state';

export function createComponent<P>(fn: (props: P) => any) {
  let template: Node | null = null;
  let pathString = '';

  return function (props: P) {
    let rootNode: Node | null = null;
    const tempBindingQueue = state.bindingQueue;
    state.bindingQueue = [];

    if (!template) {
      const data = createComponentData(fn, props);

      pathString = data.pathString;
      template = data.rootNode.cloneNode(true);
      rootNode = data.rootNode;

      while (state.bindingQueue.length) {
        const { mark, binding } = state.bindingQueue.shift()!;
        setupBinding(binding, mark);
      }
    } else {
      rootNode = template.cloneNode(true);
      setupComponent(fn, props, rootNode, pathString);
    }

    state.bindingQueue = tempBindingQueue;

    return rootNode;
  };
}

export function createComponentFn<P>(component: (props: P) => Node) {
  return (props: P) => node(component(props));
}

function setupComponent<P>(
  fn: (props: P) => any,
  props: P,
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

  fn(props);

  state.pathState = tempPathState;
  state.isCreating = tempIsCreating;
  state.path = tempPath;
  state.root = tempRoot;
}

function createComponentData<P>(fn: (props: P) => any, props: P) {
  const tempPath = state.path;
  state.path = '';

  const tempRoot = state.root;
  let rootNode: Node = document.createDocumentFragment();
  state.root = rootNode;

  const tempIsCreating = state.isCreating;
  state.isCreating = true;

  fn(props);

  let pathString = getPathString(state.path);

  state.isCreating = tempIsCreating;
  state.path = tempPath;
  state.root = tempRoot;

  if (rootNode.childNodes.length === 1) {
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
