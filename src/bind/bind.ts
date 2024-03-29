import { Signal, computed, isSignal, isWritableSignal } from '@spred/core';
import { Binding, WritableKeys } from '../common/types';
import { AttrValue, setAttribute } from '../dom/dom';
import { ClassName, fromArray, fromObject } from '../classes/classes';
import { state } from '../state/state';

type Bindings<N extends Node> = {
  [key in WritableKeys<N>]?: (() => any) extends N[key]
    ? N[key]
    : Binding<N[key]>;
} & {
  attrs?: N extends Element
    ? {
        [key: string]: AttrValue | (() => AttrValue) | Signal<AttrValue>;
      }
    : never;
  class?: N extends Element ? ClassName : never;
};

export function bind<N extends Node>(node: N, bindings: Bindings<N>) {
  if (state.creating) {
    state.setupQueue.push(() => {
      for (let key in bindings) bindProp(node, key, (bindings as any)[key]);
    });
  } else {
    for (let key in bindings) bindProp(node, key, (bindings as any)[key]);
  }
}

export function bindProp(node: any, key: any, value: any) {
  let signal: any = null;
  let attr: any = null;

  switch (key) {
    case 'attrs':
      for (let attr in value) bindAttribute(node, attr, value[attr]);
      return;

    case 'class':
      attr = 'class';

      if (typeof value === 'object') {
        if (Array.isArray(value)) value = fromArray(value);
        else if (!isSignal(value)) value = fromObject(value);
      }

      break;

    case 'value':
      if (typeof value === 'object' && isWritableSignal(value)) {
        node.addEventListener('input', (e: any) => value.set(e.target.value));
      }

      break;
  }

  if (attr) {
    bindAttribute(node, attr, value);
    return;
  }

  if (typeof value === 'function') {
    if (key[0] !== 'o' || key[1] !== 'n') signal = computed(value);
  } else if (typeof value === 'object' && value !== null) {
    signal = value;
  }

  if (signal) signal.subscribe((v: any) => (node[key] = v));
  else node[key] = value;
}

function bindAttribute(element: any, key: string, value: any) {
  let signal: any = null;

  if (typeof value === 'function') signal = computed(value);
  else if (typeof value === 'object' && value !== null) signal = value;

  if (signal) signal.subscribe((v: any) => setAttribute(element, key, v));
  else setAttribute(element, key, value);
}
