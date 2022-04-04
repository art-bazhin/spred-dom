import {
  getTemplatePartsFromElement,
  TemplatePart,
} from '../template-part/template-part';
import { isCommentNode, isElementNode, isFragmentNode } from '../dom/dom';
import {
  ATTR_MARK,
  ATTR_NUM_SEPARATOR,
  NODE_PART,
  PLACEHOLDER_COMMENT,
  PLACEHOLDER_MARK,
  PROP_MARK,
} from '../constants/constants';

const markRegEx = new RegExp(PLACEHOLDER_MARK, 'gm');
const tagRegEx = /<[a-z][a-z\d-]*([^<>]|("[^"]*")|('[^']*'))*>/gm;

const propNameGroup = '(\\.[a-zA-Z_$][0-9a-zA-Z_$]*)';
const attrNameGroup = '([a-z][a-z\\d-]*)';
const valueGroup = `(${PLACEHOLDER_MARK}|"${PLACEHOLDER_MARK}"|'${PLACEHOLDER_MARK}')`;

const attrRegEx = new RegExp(
  `(${propNameGroup}|${attrNameGroup})[\\s\\n]*=[\\s\\n]*${valueGroup}`,
  'gm'
);

const templatesMap: {
  [html: string]: Template;
} = {};

export interface Template {
  fragment: DocumentFragment;
  parts: TemplatePart[];
}

export function getTemplate(html: string, isSVG?: boolean): Template {
  const cached = templatesMap[html];

  if (cached) return cached;

  const templateElement = document.createElement('template');

  if (isSVG) html = '<svg>' + html + '</svg>';
  templateElement.innerHTML = html;

  const fragment = templateElement.content;

  if (isPlaceholder(fragment.firstChild) || !fragment.firstChild)
    fragment.insertBefore(createMarkNode(), fragment.firstChild);

  if (isSVG) {
    const svgRoot = fragment.firstChild!;

    while (svgRoot.firstChild) {
      fragment.appendChild(svgRoot.firstChild);
    }

    fragment.removeChild(svgRoot);
  }

  let node = fragment.firstChild as Node | null;
  let position = [0];
  let parts: TemplatePart[] = [];

  while (node) {
    let parent = node.parentNode;

    if (isPlaceholder(node)) {
      const mark = createMarkNode();

      parts.push({ type: NODE_PART, position: position.slice() });
      node.parentNode!.replaceChild(mark, node);
      node = mark.nextSibling;
    } else if (isElementNode(node)) {
      if (node.hasAttribute(ATTR_MARK)) {
        parts = parts.concat(getTemplatePartsFromElement(node, position));
      }

      if (node.childNodes.length) {
        node = node.childNodes[0];
        position.push(-1);
      } else {
        node = node.nextSibling;
      }
    } else {
      node = node.nextSibling;
    }

    while (!node && parent && !isFragmentNode(parent)) {
      node = parent.nextSibling;
      parent = parent.parentNode;
      position = position.slice(0, position.length - 1);
    }

    position[position.length - 1]++;
  }

  const template = {
    fragment,
    parts,
  };

  templatesMap[html] = template;

  return template;
}

export function createMarkNode() {
  if ((document as any).documentMode) return document.createComment(''); // IE
  return document.createTextNode('');
}

function isPlaceholder(node: Node | null) {
  return node && isCommentNode(node) && node.textContent === PLACEHOLDER_MARK;
}

function replaceTag(tag: string) {
  let num = 0;

  let tagProcessed = tag.replace(attrRegEx, function (attr, p1: string) {
    const isProp = p1[0] === '.';
    const isEvent = p1[0] === 'o' && p1[1] === 'n';

    if (isProp || isEvent) {
      const name = isProp ? p1.substring(1) : p1;
      const val = '"' + name + '"';
      return PROP_MARK + ATTR_NUM_SEPARATOR + num++ + '=' + val;
    }

    const val = '"' + ATTR_MARK + ATTR_NUM_SEPARATOR + num++ + '"';
    return p1 + '=' + val;
  });

  if (tagProcessed !== tag) {
    tagProcessed = tagProcessed.replace(/<[^\s\n]+/, '$& ' + ATTR_MARK);
  }

  return tagProcessed;
}

function getTemplateHTML(strings: TemplateStringsArray) {
  let html = strings.join(PLACEHOLDER_MARK).replace(tagRegEx, replaceTag);
  return html.replace(markRegEx, PLACEHOLDER_COMMENT);
}
