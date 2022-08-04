import {
  START_CHILDREN,
  END_CHILDREN,
  next,
  state,
  PARENT_NODE,
  FIRST_CHILD,
} from '../state/state';
import { PropsWithAttrs, spec } from '../spec/spec';

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: PropsWithAttrs<HTMLElementTagNameMap[TagName]>
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  fn: () => any
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: PropsWithAttrs<HTMLElementTagNameMap[TagName]>,
  fn: () => any
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  second?: any,
  third?: any
) {
  let props: PropsWithAttrs<HTMLElementTagNameMap[TagName]> | undefined;
  let fn: (() => any) | undefined;

  switch (arguments.length) {
    case 2:
      if (typeof second === 'function') fn = second;
      else props = second;
      break;
    case 3:
      props = second;
      fn = third;
      break;
  }

  if (state.isCreating) {
    const child = document.createElement(tag);

    state.root!.appendChild(child);

    state.root = child;
    state.path += FIRST_CHILD;

    spec(props);

    if (fn) {
      state.path += START_CHILDREN;
      fn && fn();
      state.path += END_CHILDREN;
    }

    state.path += PARENT_NODE;
    state.root = state.root!.parentNode;

    return;
  }

  spec(props);
  next(fn);

  return;
}
