export type SSRPart = string | (() => string);

interface SSRState {
  ssr: boolean;
  parts: SSRPart[];
  createTemplate: typeof createTemplate;
  h: typeof h;
  addMark: typeof addMark;
}

export const ssrState: SSRState = {
  ssr: false,
  parts: [],
} as any;

export function renderToString<A extends unknown[]>(
  Component: (...args: A) => Node,
  args: A
) {
  initSSR();

  ssrState.ssr = true;
  const str = Component(...args) as any as string;
  ssrState.ssr = false;

  return str;
}

function initSSR() {
  if (ssrState.createTemplate!) return;

  ssrState.createTemplate = createTemplate;
  ssrState.h = h;
}

function createTemplate<A extends unknown[]>(fn: (...args: A) => any, args: A) {
  return (...args: A) => {
    const prevParts = ssrState.parts;
    const parts: SSRPart[] = [];

    ssrState.parts = parts;
    fn(...args);
    ssrState.parts = prevParts;

    return buildStringFromParts(parts);
  };
}

function buildStringFromParts(parts: SSRPart[]) {
  let result = '';

  for (let part of parts) {
    result += typeof part === 'string' ? part : part();
  }

  return result;
}

function h(tag?: string, props?: Record<string, any>, fn?: () => any) {
  if (tag) ssrState.parts.push('<' + tag + attrs(props) + '>');
  if (fn) fn();
  if (tag) ssrState.parts.push('</' + tag + '>');
}

function attrs(props?: Record<string, any>) {
  return '';
}

function addMark() {
  ssrState.parts.push('<!---->');
}
