import { next, state, PARENT_NODE, FIRST_CHILD } from '../state/state';
import {
  TemplateResult,
  TEMPLATE_RESULT,
} from '../template-result/template-result';
import { AttrValue, Falsy, removeNodes, setAttribute } from '../dom/dom';
import { Signal, computed, isSignal } from '@spred/core';
import { Binding, WritableNonFnKeys } from '../common/types';

interface Attrs {
  [attr: string]: AttrValue;
}

type NodeProps<N extends Node> = {
  [key in WritableNonFnKeys<N>]?: (() => any) extends N[key] ? never : N[key];
};

type Props<N extends Node> = NodeProps<N> & {
  attrs?: N extends HTMLElement ? Attrs : never;
};

const test: NodeProps<HTMLAnchorElement> = {};

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

export function h<TagName extends null>(
  tag: TagName,
  setup: () => void,
): TemplateResult<DocumentFragment>;

export function h(
  node: Binding<Node | Falsy>,
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
          const parent = state.node;

          state.path += FIRST_CHILD + PARENT_NODE;
          state.node!.appendChild(mark);
          state.setupQueue.push(() => setupNode(first, mark, parent!));

          return TEMPLATE_RESULT;
        }

        next();
        setupNode(first, state.node!, state.node!.parentNode!);

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
          setAttribute(element, attr, props.attrs[attr]);
        delete props.attrs;
      }

      for (let key in props) (element as any)[key] = (props as any)[key];
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
  mark: Node,
  parent: Node,
) {
  if (!binding) return;

  if (typeof binding === 'function') {
    setupSignalNode(computed(binding), mark, parent);
    return;
  }

  if (typeof binding === 'object' && isSignal(binding)) {
    setupSignalNode(binding, mark, parent);
    return;
  }

  parent.insertBefore(binding, mark);
}

function setupSignalNode(
  binding: Signal<Node | Falsy>,
  mark: Node,
  parent: Node,
) {
  let start = mark.previousSibling;

  if (!start) {
    start = document.createComment('');
    parent.insertBefore(start, mark);
  }

  binding.subscribe((node) => {
    removeNodes(start!.nextSibling!, mark);
    if (node) parent.insertBefore(node, mark);
  });
}
