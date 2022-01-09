import {
  ATTR_MARK,
  ATTR_NUM_SEPARATOR,
  PLACEHOLDER_COMMENT,
  PROP_MARK,
} from '../constants/constants';
import { isDOMNode } from '../dom/dom';
import {
  Child,
  isTemplateNode,
  TemplateNode,
  VOID_HTML_TAGS_MAP,
} from '../template-node/template-node';
import { isFalsy } from '../utils/is-falsy';

export interface TemplateResult {
  str: string;
  values: unknown[];
  isSVG?: boolean;
}

export function createTemplateResult(
  node: TemplateNode,
  isSVG?: boolean
): TemplateResult {
  const { tag, props, children } = node;

  let str = '';
  let values: unknown[] = [];
  let hasCloseTag = false;

  if (tag) {
    str += '<' + tag;
    hasCloseTag = isSVG || !VOID_HTML_TAGS_MAP[tag];

    if (props) {
      const attrs = props.attrs;
      let num = 0;

      if (attrs) {
        for (let attr in attrs) {
          let value = attrs[attr];

          if (typeof value === 'function') {
            str +=
              ' ' + attr + '="' + ATTR_MARK + ATTR_NUM_SEPARATOR + num++ + '"';
            values.push(value);
            continue;
          }

          if (isFalsy(value)) continue;

          if (value === true) value = '';

          str += ' ' + attr + '="' + value + '"';
        }
      }

      for (let prop in props) {
        if (prop === 'attrs') continue;

        str += ' ' + PROP_MARK + ATTR_NUM_SEPARATOR + num++ + '="' + prop + '"';
        values.push(props[prop]);
      }

      if (num) str += ' ' + ATTR_MARK;
    }

    str += '>';
  }

  if (children) {
    const processChild = (child: Child) => {
      if (isFalsy(child)) return;

      if (isTemplateNode(child)) {
        const result = createTemplateResult(child);

        str += result.str;
        values = values.concat(result.values);

        return;
      }

      if (typeof child === 'function' || isDOMNode(child)) {
        str += PLACEHOLDER_COMMENT;
        values.push(child);

        return;
      }

      str += child;
    };

    children.forEach(processChild);
  }

  if (hasCloseTag) {
    str += '</' + tag + '>';
  }

  return { str, values, isSVG };
}
