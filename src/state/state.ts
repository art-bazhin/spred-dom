interface State {
  node: Node | null;
  creating: boolean;
  path: string;
  setupQueue: (() => any)[];
  i: number;
}

export const state: State = {
  node: null,
  creating: false,
  path: '',
  setupQueue: [],
  i: 0,
};

export const FIRST_CHILD = 'F';
export const NEXT_SIBLING = 'N';
export const PARENT_NODE = 'P';

export function next() {
  switch (state.path[state.i++]) {
    case FIRST_CHILD:
      state.node = state.node!.firstChild;
      break;

    case NEXT_SIBLING:
      state.node = state.node!.nextSibling;
      break;
  }
}
