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
  return fromArray(arguments as any);
}

export function fromObject(obj: ClassMap) {
  let functions: string[] | undefined;
  let signals: string[] | undefined;
  let result = '';
  let functionResult: (() => string | null) | undefined;

  for (let key in obj) {
    const value = obj[key];

    if (value) {
      if (typeof value === 'function') {
        if (!functions) functions = [];
        functions.push(key);
        continue;
      }

      if (isSignal(value)) {
        if (!signals) signals = [];
        signals.push(key);
        continue;
      }

      if (result) result += ' ';
      result += key;
    }
  }

  if (functions) {
    functionResult = () => {
      let dynamicResult = result;

      for (let key of functions!) {
        const value = (obj as any)[key]();

        if (!value) continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += key;
      }

      return dynamicResult || null;
    };
  }

  if (signals) {
    if (functionResult) result = functionResult() || '';

    return computed(() => {
      let dynamicResult = result;

      for (let key of signals!) {
        const value = (obj as any)[key].get();

        if (!value) continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += key;
      }

      return dynamicResult || null;
    });
  }

  return functionResult || result || null;
}

export function fromArray(arr: ClassName[]) {
  let functions: (() => Falsy | string)[] | undefined;
  let signals: Signal<Falsy | string>[] | undefined;
  let result = '';
  let functionResult: (() => string | null) | undefined;

  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];

    if (!item) continue;

    if (typeof item === 'object') {
      if (Array.isArray(item)) item = fromArray(item);
      else if (!isSignal(item)) item = fromObject(item);
    }

    if (typeof item === 'function') {
      if (!functions) functions = [];
      functions.push(item);
      continue;
    }

    if (typeof item === 'string') {
      if (result) result += ' ';
      result += item;
      continue;
    }

    if (isSignal(item)) {
      if (!signals) signals = [];
      signals.push(item);
      continue;
    }
  }

  if (functions) {
    functionResult = () => {
      let dynamicResult = result;

      for (let fn of functions!) {
        const value = fn();

        if (!value || typeof value !== 'string') continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += value;
      }

      return dynamicResult || null;
    };
  }

  if (signals) {
    if (functionResult) result = functionResult() || '';

    return computed(() => {
      let dynamicResult = result;

      for (let s of signals!) {
        const value = s.get();

        if (!value || typeof value !== 'string') continue;
        if (dynamicResult) dynamicResult += ' ';
        dynamicResult += value;
      }

      return dynamicResult || null;
    });
  }

  return functionResult || result || null;
}
