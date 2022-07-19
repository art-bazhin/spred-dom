import { Component } from '../component/component';

interface State {
  root: Node | null;
  isCreating: boolean;
  mountedNode: Node[];
  path: string;
  pathState: {
    path: string;
    i: number;
    node: Node | null;
  };
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
  path: '',
  pathState: {
    path: '',
    i: 0,
    node: null,
  },
  lastChild: null,
  setupQueue: [],
};

export function storeStateValues() {
  const root = state.root;
  const path = state.path;
  const isCreating = state.isCreating;

  return () => {
    state.root = root;
    state.path = path;
    state.isCreating = isCreating;
  };
}

export function startCreating(container: Node) {
  state.root = container;
  state.path = '';
  state.isCreating = true;
}

export function getPathString() {}

export function startComponentCreating() {
  const fragment = document;
}

export function next(fn?: () => any) {
  const pathState = state.pathState;

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
