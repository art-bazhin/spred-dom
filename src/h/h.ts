import { next, state, PARENT_NODE, FIRST_CHILD } from '../state/state';
import {
  TemplateResult,
  TEMPLATE_RESULT,
} from '../template-result/template-result';
import {
  AttrValue,
  Falsy,
  insertBefore,
  removeNodes,
  setupBaseAttr,
} from '../dom/dom';
import { Signal, computed, isSignal } from '@spred/core';

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

interface Attrs {
  [attr: string]: AttrValue;
}

type ElProps<Element extends HTMLElement> = {
  [key in WritableKeys<Element>]?: (() => any) extends Element[key]
    ? never
    : Element[key];
};

type Props<Element extends HTMLElement> = ElProps<Element> & {
  attrs?: Attrs;
};

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  setup: (element: HTMLElementTagNameMap[TagName]) => void,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h(
  tag: null,
  setup: () => void,
): TemplateResult<DocumentFragment>;

export function h(
  node: Node | Falsy | Signal<Node | Falsy> | (() => Node | Falsy),
): TemplateResult<DocumentFragment>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>,
  setup: (element: HTMLElementTagNameMap[TagName]) => void,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h(first: any, second?: any, third?: any) {
  let props: Props<any> | undefined;
  let setup: ((element?: Node) => void) | undefined;
  let tag: string | null | undefined;

  switch (arguments.length) {
    case 1:
      if (typeof first === 'string') tag = first;
      else {
        if (state.creating) {
          const mark = document.createComment('');

          state.path += FIRST_CHILD + PARENT_NODE;
          state.node!.appendChild(mark);
          state.setupQueue.push(() => setupNode(first, mark));

          return TEMPLATE_RESULT;
        }

        next();
        setupNode(first, state.node);

        return TEMPLATE_RESULT;
      }

      break;

    case 2:
      tag = first;
      if (typeof second === 'function') setup = second;
      else props = second;
      break;

    case 3:
      tag = first;
      props = second;
      setup = third;
      break;
  }

  if (!tag) {
    setup!();
    return TEMPLATE_RESULT;
  }

  if (state.creating) {
    const prevNode = state.node;
    const element = document.createElement(tag);

    state.node!.appendChild(element);

    if (props && state.creating) {
      if (props.attrs) {
        for (let attr in props.attrs)
          setupBaseAttr(element, attr, props.attrs[attr]);
        delete props.attrs;
      }

      for (let key in props) (element as any)[key] = props[key];
    }

    state.node = element;
    state.path += FIRST_CHILD;

    if (setup) setup(element);

    state.path += PARENT_NODE;
    state.node = prevNode;

    return TEMPLATE_RESULT;
  }

  next();
  const prevNode = state.node;

  if (setup) setup(prevNode!);

  state.node = prevNode;

  return TEMPLATE_RESULT;
}

function setupNode(
  binding: Node | Falsy | Signal<Node | Falsy> | (() => Node | Falsy),
  mark: Node | null,
) {
  if (!mark || !binding) return;

  if (typeof binding === 'function') {
    setupSignalNode(computed(binding), mark);
    return;
  }

  if (typeof binding === 'object' && isSignal(binding)) {
    setupSignalNode(binding, mark);
    return;
  }

  insertBefore(binding, mark);
}

function setupSignalNode(binding: Signal<Node | Falsy>, mark: Node) {
  let start = mark.previousSibling;

  if (!start) {
    start = document.createComment('');
    insertBefore(start, mark);
  }

  binding.subscribe((node) => {
    removeNodes(start!.nextSibling!, mark);
    if (node) insertBefore(node, mark);
  });
}
