interface CreatingState {
  root: Node | null;
  isCreating: boolean;
  path: string;
  setupQueue: (() => any)[];
}

interface TraversalState {
  path: string;
  i: number;
  node: Node | null;
}

export const creatingState: CreatingState = {
  root: null,
  isCreating: false,
  path: '',
  setupQueue: [],
};

export const traversalState: TraversalState = {
  path: '',
  i: 0,
  node: null,
};

export const FIRST_CHILD = 'F';
export const NEXT_SIBLING = 'N';
export const PARENT_NODE = 'P';
export const BINDING = 'B';
export const START_CHILDREN = '>';
export const END_CHILDREN = '<';

export function next(fn?: () => any) {
  const current = traversalState.path[traversalState.i];
  const nextValue = traversalState.path[++traversalState.i];
  const goDeeper = nextValue === START_CHILDREN;

  switch (current) {
    case FIRST_CHILD:
      traversalState.node = traversalState.node!.firstChild;
      break;

    case NEXT_SIBLING:
      traversalState.node = traversalState.node!.nextSibling;
      break;

    case PARENT_NODE:
      traversalState.node = traversalState.node!.parentNode;
      next(fn);
      break;
  }

  if (goDeeper && fn) {
    ++traversalState.i;
    fn();
  }
}
