interface State {
  root: Node | null;
  isCreating: boolean;
  path: string;
  pathState: {
    path: string;
    i: number;
    node: Node | null;
  };
  lastChild: Node | null;
  setupQueue: (() => any)[];
}

export const state: State = {
  root: null,
  isCreating: false,
  path: '',
  pathState: {
    path: '',
    i: 0,
    node: null,
  },
  lastChild: null,
  setupQueue: [],
};

export const FIRST_CHILD = 'F';
export const NEXT_SIBLING = 'N';
export const PARENT_NODE = 'P';
export const BINDING = 'B';
export const START_CHILDREN = '>';
export const END_CHILDREN = '<';

export function next(fn?: () => any) {
  const pathState = state.pathState;

  if (!pathState) return;

  const current = pathState.path[pathState.i];
  const nextValue = pathState.path[++pathState.i];
  const goDeeper = nextValue === START_CHILDREN;

  switch (current) {
    case FIRST_CHILD:
      pathState.node = pathState.node!.firstChild;
      break;

    case NEXT_SIBLING:
      pathState.node = pathState.node!.nextSibling;
      break;

    case PARENT_NODE:
      pathState.node = pathState.node!.parentNode;
      next(fn);
      break;
  }

  if (goDeeper) {
    ++pathState.i;
    fn && fn();
  }
}
