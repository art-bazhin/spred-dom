import { Component } from '../component/component';

interface State {
  root: Node | null;
  isCreating: boolean;
  mountedNode: Node[];
  path: string | null;
  pathStack: {
    path: string;
    i: number;
    node: Node | null;
  }[];
  lastChild: Node | null;
  setupQueue: {
    mark: Node;
    binding: () => Component<any>;
  }[];
}

export const state: State = {
  root: null,
  isCreating: false,
  mountedNode: [],
  path: null,
  pathStack: [],
  lastChild: null,
  setupQueue: [],
};

export function push(el: any) {
  state.root = el;
  return state.root;
}

export function pop() {
  state.root = state.root!.parentNode;
  return state.root;
}

export function next(fn?: () => any) {
  const pathState = state.pathStack[0];

  if (!pathState) return;

  const current = pathState.path[pathState.i];
  const nextValue = pathState.path[++pathState.i];
  const goDeeper = nextValue === 's';

  switch (current) {
    case '_':
      if (goDeeper) {
        ++pathState.i;
        fn && fn();
      }
      break;

    case 'f':
      pathState.node = pathState.node!.firstChild;
      if (goDeeper) {
        ++pathState.i;
        fn && fn();
      }
      break;

    case 'n':
      pathState.node = pathState.node!.nextSibling;
      if (goDeeper) {
        ++pathState.i;
        fn && fn();
      }
      break;

    case 'l':
      pathState.node = state.lastChild!.nextSibling;
      if (goDeeper) {
        ++pathState.i;
        fn && fn();
      }
      break;

    case 'p':
      state.lastChild = pathState.node;
      pathState.node = pathState.node!.parentNode;
      next(fn);
      break;
  }
}
