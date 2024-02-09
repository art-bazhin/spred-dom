import {
  START_CHILDREN,
  END_CHILDREN,
  next,
  state,
  PARENT_NODE,
  FIRST_CHILD,
  BINDING,
} from '../state/state';
import { Props, spec } from '../spec/spec';
import {
  TemplateResult,
  TEMPLATE_RESULT,
} from '../template-result/template-result';

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  fn: () => any,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  fn: () => any,
): TemplateResult<DocumentFragment>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>,
  fn: () => any,
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h(first: any, second?: any, third?: any) {
  let props: Props<any> | undefined;
  let fn: (() => any) | undefined;
  let tag: string | undefined;

  switch (arguments.length) {
    case 1:
      if (typeof first === 'function') fn = first;
      else tag = first;
      break;

    case 2:
      tag = first;
      if (typeof second === 'function') fn = second;
      else props = second;
      break;

    case 3:
      tag = first;
      props = second;
      fn = third;
      break;
  }

  if (!tag) {
    fn!();
    return TEMPLATE_RESULT;
  }

  if (state.creating) {
    const child = document.createElement(tag);

    state.node!.appendChild(child);

    state.node = child;
    state.path += FIRST_CHILD;

    if (props) spec(props);

    if (fn) {
      state.path += START_CHILDREN;
      fn();
      state.path += END_CHILDREN;
    }

    state.path += PARENT_NODE;
    state.node = state.node!.parentNode;

    return TEMPLATE_RESULT;
  }

  next(fn);

  if (props && state.path[state.i] === BINDING) {
    spec(props);
    next(fn);
  }

  return TEMPLATE_RESULT;
}
