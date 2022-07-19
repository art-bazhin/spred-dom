import { state } from '../state/state';

type Props = {
  [key: string]: () => unknown;
} | void;

export type Component<P extends Props> = ((props: P) => Node) & {
  $$isComponent: true;
};

const EMPTY_FRAGMENT = document.createDocumentFragment();

export function createComponent<P extends Props>(fn: (props: P) => any) {
  let rootNode: Node | null = null;
  let template: Node | null = null;
  let pathString = '';

  const component: any = function (props: P) {
    // if (state.isCreating && state.root) {
    //   state.path += 'fbp';

    //   const mark = document.createComment('');
    //   state.setupQueue.push({ mark, binding: () => component(props) });

    //   state.root.appendChild(mark);
    //   return EMPTY_FRAGMENT;
    // }

    if (!template) {
      const data = createComponentData(fn, props);

      pathString = data.pathString;
      template = data.rootNode.cloneNode(true);
      rootNode = data.rootNode;

      console.log(1, pathString);
    } else {
      rootNode = template.cloneNode(true);
      setupComponent(fn, props, rootNode, pathString);

      console.log(2, pathString);
    }

    // while (state.setupQueue.length) {
    //   const { mark, binding } = state.setupQueue.shift()!;

    //   if (isSignal(binding)) {
    //     setupBinding(binding as any, mark);
    //   } else {
    //     insertBefore((binding as any)()(), mark);
    //   }
    // }

    // if (node && clone) {
    //   const parent = node!.parentNode!;
    //   parent.insertBefore(clone, node);
    //   return EMPTY_FRAGMENT;
    // }

    return rootNode;
  };

  component.$$isComponent = true;

  return component as Component<P>;
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

  const tempPathState = state.pathState;
  state.pathState = {
    path: pathString,
    i: 0,
    node: container,
  };

  fn(props);

  state.pathState = tempPathState;
  state.root = tempRoot;
  state.path = tempPath;
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
