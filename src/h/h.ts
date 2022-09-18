import {
  START_CHILDREN,
  END_CHILDREN,
  next,
  creatingState,
  PARENT_NODE,
  FIRST_CHILD,
} from '../state/state';
import { Props, spec } from '../spec/spec';
import {
  TemplateResult,
  TEMPLATE_RESULT,
} from '../template-result/template-result';

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  fn: () => any
): TemplateResult<HTMLElementTagNameMap[TagName]>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  fn: () => any
): TemplateResult<DocumentFragment>;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>,
  fn: () => any
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

  if (creatingState.isCreating) {
    const child = document.createElement(tag);

    creatingState.root!.appendChild(child);

    creatingState.root = child;
    creatingState.path += FIRST_CHILD;

    spec(props);

    if (fn) {
      creatingState.path += START_CHILDREN;
      fn();
      creatingState.path += END_CHILDREN;
    }

    creatingState.path += PARENT_NODE;
    creatingState.root = creatingState.root!.parentNode;

    return TEMPLATE_RESULT;
  }

  next(fn);
  spec(props, fn);

  return TEMPLATE_RESULT;
}
