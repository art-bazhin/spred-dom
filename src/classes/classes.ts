import { computed, Signal } from 'spred';
import { Falsy } from '../dom/dom';

export type ClassMap = Record<string, unknown>;

export type ClassName =
  | Falsy
  | string
  | (() => Falsy | string)
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
      if (typeof value === 'function') {
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
        const value = (obj[key] as any)();
        if (!value) continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += key;
      }

      return dynamicResult;
    };
  }

  return result || null;
}

export function fromArray(arr: ClassName[]) {
  let result = '';
  let dynamic: (() => Falsy | string)[] | undefined;

  for (let i = 0; i < arr.length; i++) {
    let item = arr[i] as any;

    if (!item) continue;

    if (typeof item === 'object') {
      item = Array.isArray(item) ? fromArray(item) : fromObject(item as any);
    }

    if (item) {
      const itemType = typeof item;

      if (itemType === 'function') {
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

      for (let fn of dynamic!) {
        const add = fn();

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
