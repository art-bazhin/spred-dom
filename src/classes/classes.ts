import { computed, isSignal, Signal } from '@spred/core';
import { Falsy } from '../dom/dom';

export type ClassMap = Record<string, unknown>;

export type ClassName =
  | Falsy
  | string
  | (() => Falsy | string)
  | Signal<Falsy | string>
  | ClassMap
  | ClassName[];

export function classes(
  ...args: ClassName[]
): string | null | Signal<string | null>;
export function classes() {
  const result = fromArray(arguments as any);

  if (typeof result === 'function') {
    return computed(result);
  }

  return result;
}

export function fromObject(obj: ClassMap) {
  let dynamic: string[] | undefined;
  let result = '';

  for (let key in obj) {
    const value = obj[key];

    if (value) {
      if (
        typeof value === 'function' ||
        (typeof value === 'object' && isSignal(value))
      ) {
        if (!dynamic) dynamic = [];
        dynamic.push(key);
        continue;
      }

      if (result) result += ' ';
      result += key;
    }
  }

  if (dynamic) {
    return () => {
      let dynamicResult = result;

      for (let key of dynamic!) {
        const prop = obj[key];
        const value =
          typeof prop === 'object' ? (prop as any).get() : (prop as any)();

        if (!value) continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += key;
      }

      return dynamicResult || null;
    };
  }

  return result || null;
}

export function fromArray(arr: ClassName[]) {
  let result = '';
  let dynamic: (Signal<Falsy | string> | (() => Falsy | string))[] | undefined;

  for (let i = 0; i < arr.length; i++) {
    let item = arr[i] as any;
    let signal = false;

    if (!item) continue;

    if (typeof item === 'object') {
      if (Array.isArray(item)) item = fromArray(item);
      else if (isSignal(item)) signal = true;
      else item = fromObject(item);
    }

    if (item) {
      const itemType = typeof item;

      if (signal || itemType === 'function') {
        if (!dynamic) dynamic = [];
        dynamic.push(item);
      } else if (itemType === 'string') {
        if (result) result += ' ';
        result += item;
      }
    }
  }

  if (dynamic) {
    return () => {
      let dynamicResult = result;

      for (let el of dynamic!) {
        const add = typeof el === 'object' ? el.get() : el();

        if (add && typeof add === 'string') {
          if (dynamicResult) dynamicResult += ' ';
          dynamicResult += add;
        }
      }
      return dynamicResult || null;
    };
  }

  return result || null;
}
