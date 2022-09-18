import { Signal } from 'spred';
import { Falsy } from '../dom/dom';

export type SSRPart = string | (() => Promise<SSRPart[]>);

interface SSRState {
  ssr: boolean;
  parts: SSRPart[];
  shouldRender: boolean;
  promise: (() => Promise<string>) | null;
  h: typeof h;
  node: typeof node;
  createTemplate: typeof createTemplate;
}

export const ssrState: SSRState = {
  ssr: false,
  parts: createParts(),
} as any;

export async function renderToString(Component: () => Node) {
  initSSR();

  const res = Component() as any;
  const parts = res.__ssr__ === 2 ? await res() : res;

  return buildStringFromParts(parts).then((str) => {
    ssrState.ssr = false;
    return str;
  });
}

export const env = Object.freeze({
  get server() {
    return ssrState.ssr;
  },

  get client() {
    return !ssrState.ssr;
  },

  await(fn: () => Promise<any>) {
    if (this.server) {
      ssrState.promise = fn;
    } else {
      fn();
    }
  },
});

function initSSR() {
  ssrState.parts = createParts();
  ssrState.ssr = true;
  ssrState.shouldRender = true;
  ssrState.h = h;
  ssrState.createTemplate = createTemplate;
  ssrState.node = node;
}

function createParts() {
  const parts: any = [];
  parts.__ssr__ = 1;
  return parts;
}

function createTemplate<A extends unknown[]>(fn: (...args: A) => any) {
  return (...args: A) => {
    // if (!ssrState.shouldRender) return;
    // ssrState.shouldRender = false;

    const prevParts = ssrState.parts;

    ssrState.parts = createParts();
    const res = fn(...args);
    ssrState.parts = prevParts;

    return res;
  };
}

async function buildStringFromParts(parts: SSRPart[]): Promise<any> {
  let result = '';

  for (let part of parts) {
    if (typeof part === 'string') {
      result += part;
    } else {
      const nextPart = typeof part === 'function' ? await part() : part;
      const nextResult = await buildStringFromParts(nextPart);

      result += nextResult;
    }
  }

  return result;
}

function node(value: any) {
  if (!value.__ssr__ && typeof value === 'function') {
    value = value();
  }

  add(value);
  add('<!---->');
}

function h(tag?: string, props?: Record<string, any>, fn?: () => any) {
  const promise = ssrState.promise;

  ssrState.promise = null;

  if (promise) {
    const res: any = async () => {
      const prevParts = ssrState.parts;
      const parts: SSRPart[] = createParts();

      ssrState.parts = parts;

      await promise();
      hSync(tag, props, fn);

      ssrState.parts = prevParts;

      return parts;
    };

    res.__ssr__ = 2;

    return res;
  }

  hSync(tag, props, fn);

  return ssrState.parts;
}

function hSync(tag?: string, props?: Record<string, any>, fn?: () => any) {
  const text = getText(props);

  if (tag) openTag(tag, props);
  if (fn) fn();
  else if (text) add(text);
  if (tag) closeTag(tag);
}

function getText(props?: Record<string, any>) {
  if (!props) return '';

  const text = props.text || props.textContent;

  if (!text) return '';
  return typeof text === 'function' ? text() : text;
}

function openTag(tag: string, props?: Record<string, any>) {
  add('<' + tag + attrs(props) + '>');
}

function closeTag(tag: string) {
  add('</' + tag + '>');
}

function attrs(props?: Record<string, any>) {
  let str = '';
  return str;

  if (!props) return str;

  for (let key in props) {
    str += ' ';
  }
}

function add(value: any) {
  ssrState.parts.push(value);
}
