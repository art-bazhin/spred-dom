import {
  START_CHILDREN,
  END_CHILDREN,
  next,
  creatingState,
  PARENT_NODE,
  FIRST_CHILD,
} from '../state/state';
import { Props, spec } from '../spec/spec';

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  fn: () => any
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  props: Props<HTMLElementTagNameMap[TagName]>,
  fn: () => any
): void;

export function h<TagName extends keyof HTMLElementTagNameMap>(
  tag: TagName,
  second?: any,
  third?: any
) {
  let props: Props<HTMLElementTagNameMap[TagName]> | undefined;
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

    return;
  }

  next(fn);
  spec(props, fn);

  return;
}
