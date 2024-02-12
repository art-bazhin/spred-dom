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
): string | null | (() => string | null);
export function classes() {
  return fromArray(arguments as any);
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
        const getter = (obj as any)[key];
        const value = typeof getter === 'function' ? getter() : getter.get();

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
  let dynamic: ((() => Falsy | string) | Signal<Falsy | string>)[] | undefined;
  let result = '';

  for (let item of arr) {
    if (!item) continue;

    if (typeof item === 'object') {
      if (Array.isArray(item)) item = fromArray(item);
      else if (!isSignal(item)) item = fromObject(item);
    }

    if (typeof item === 'string') {
      if (result) result += ' ';
      result += item;
      continue;
    } else if (
      typeof item === 'function' ||
      (typeof item === 'object' && isSignal(item))
    ) {
      if (!dynamic) dynamic = [];
      dynamic.push(item as any);
    }
  }

  if (dynamic) {
    return () => {
      let dynamicResult = result;

      for (let getter of dynamic!) {
        const value = typeof getter === 'function' ? getter() : getter.get();

        if (!value || typeof value !== 'string') continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += value;
      }

      return dynamicResult || null;
    };
  }

  return result || null;
}
