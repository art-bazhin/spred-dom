interface State {
  root: Node | null;
  node: Node | null;
  creating: boolean;
  path: string;
  setupQueue: (() => any)[];
  i: number;
}

export const state: State = {
  root: null,
  node: null,
  creating: false,
  path: '',
  setupQueue: [],
  i: 0,
};

export const FIRST_CHILD = 'F';
export const NEXT_SIBLING = 'N';
export const PARENT_NODE = 'P';
export const BINDING = 'B';
export const START_CHILDREN = '>';
export const END_CHILDREN = '<';

export function next(fn?: () => any) {
  const current = state.path[state.i];
  const nextValue = state.path[++state.i];

  switch (current) {
    case FIRST_CHILD:
      state.node = state.node!.firstChild;
      break;

    case NEXT_SIBLING:
      state.node = state.node!.nextSibling;
      break;

    case PARENT_NODE:
      state.node = state.node!.parentNode;
      next(fn);
      break;
  }

  if (nextValue === START_CHILDREN) {
    ++state.i;
    fn!();
  }
}
