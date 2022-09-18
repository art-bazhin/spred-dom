import { Signal } from 'spred';
import { Falsy } from '../dom/dom';

export type SSRPart = string | (() => Promise<string>);

interface SSRState {
  ssr: boolean;
  parts: SSRPart[];
  str: string;
  i: number;
  shouldRender: boolean;
  promise: (() => Promise<string>) | null;
  h: typeof h;
  node: typeof node;
  createTemplate: typeof createTemplate;
}

export const ssrState: SSRState = {
  ssr: false,
  i: 0,
  str: '',
  parts: [],
} as any;

export async function renderToString(Component: () => Node) {
  initSSR();

  const value = Component() as any;
  const res =
    typeof value === 'function' ? await value() : buildStringFromParts(value);

  ssrState.ssr = false;

  return res;
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
  ssrState.i = 0;
  ssrState.str = '';
  ssrState.parts = [''];
  ssrState.ssr = true;
  ssrState.shouldRender = true;
  ssrState.h = h;
  ssrState.createTemplate = createTemplate;
  ssrState.node = node;
}

// function createParts() {
//   const parts: any = [];
//   parts.__ssr__ = 1;
//   return parts;
// }

function createTemplate<A extends unknown[]>(fn: (...args: A) => any) {
  return (...args: A) => {
    const prevI = ssrState.i;
    const prevParts = ssrState.parts;

    ssrState.i = 0;
    ssrState.parts = [''];

    const res = fn(...args);

    ssrState.i = prevI;
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
      result += await part();
    }
  }

  return result;
}

function node(value: any) {
  // if (typeof value === 'function') {
  //   if (value.__ssr__) {
  //   } else {
  //     value = value();
  //   }
  // }

  // console.log(value);
  add('<!--[-->');

  // if (typeof value === 'function') {
  //   if (value.__ssr__) {
  //     ssrState.parts.push(ssrState.str);
  //     ssrState.parts.push(value);
  //     ssrState.str = '';
  //   }
  // }

  add(value);

  add('<!--]-->');
}

function h(tag?: string, props?: Record<string, any>, fn?: () => any) {
  const promise = ssrState.promise;

  ssrState.promise = null;

  if (promise) {
    const res: any = async () => {
      const prevParts = ssrState.parts;
      const prevI = ssrState.i;
      const parts = [''];

      ssrState.i = 0;
      ssrState.parts = parts;

      await promise();
      hSync(tag, props, fn);

      ssrState.parts = prevParts;
      ssrState.i = prevI;

      return buildStringFromParts(parts);
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
  const i = ssrState.i;
  ssrState.parts[i] += value;
}
