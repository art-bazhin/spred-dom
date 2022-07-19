import { isSignal } from 'spred';
import { setupBinding } from '../bind/bind';
import { insertBefore } from '../dom/dom';
import { mount } from '../mount/mount';
import { push, next, state } from '../state/state';

type Props = {
  [key: string]: () => unknown;
} | void;

export type Component<P extends Props> = ((props: P) => void) & {
  $$isComponent: true;
};

export function createComponent<P extends Props>(fn: (props: P) => any) {
  let template: Node | null = null;
  let fragment: Node | null = null;
  let pathString = '';

  const component: any = function (props: P) {
    next();

    const pathState = state.pathStack[0];
    const node = pathState && pathState.node;

    let isFirstRender = false;

    if (!node && !state.mountedNode[0]) return;

    if (state.isCreating && state.root) {
      state.path += 'fbp';

      const mark = document.createComment('');
      state.setupQueue.push({ mark, binding: () => component(props) });

      state.root.appendChild(mark);
      return;
    }

    if (!template) {
      isFirstRender = true;
      state.path = pathString;

      const tempRoot = state.root;
      fragment = document.createDocumentFragment();

      state.isCreating = true;
      push(fragment);

      fn(props);

      state.isCreating = false;
      push(tempRoot);

      pathString = state.path
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

      state.path = '';

      if (fragment.childNodes.length === 1) {
        fragment = fragment.firstChild!;
        if (pathString[0] === 'f') pathString = '_' + pathString.substring(1);
      }

      template = fragment.cloneNode(true);
    }

    const container = state.mountedNode[0];

    if (state.mountedNode[0]) {
      state.mountedNode.shift();
    } else {
      next();
    }

    const clone = isFirstRender ? fragment : template.cloneNode(true);

    if (!isFirstRender) {
      state.pathStack.unshift({
        path: pathString,
        i: 0,
        node: clone,
      });

      fn(props);

      state.pathStack.shift();
    }

    isFirstRender = false;

    while (state.setupQueue.length) {
      const { mark, binding } = state.setupQueue.shift()!;

      if (isSignal(binding)) {
        setupBinding(binding as any, mark);
      } else {
        const content = document.createDocumentFragment();

        mount(binding, content);
        insertBefore(content, mark);
      }
    }

    if (!container && node && clone) {
      const parent = node!.parentNode!;
      parent.insertBefore(clone, node);
      return;
    }

    if (container && clone) container.appendChild(clone);

    return;
  };

  component.$$isComponent = true;

  return component as Component<P>;
}
