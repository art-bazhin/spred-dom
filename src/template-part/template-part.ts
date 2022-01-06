import {
  ATTR_MARK,
  ATTR_PART,
  REF_PART,
  ATTR_NUM_SEPARATOR,
  REF_ATTR_NAME,
  PROP_MARK,
  PROP_PART,
} from '../constants/constants';

function getAttributes(node: Element) {
  const attrs = node.attributes;
  const result: {
    name: string;
    type: number;
  }[] = [];

  for (let i = 0; i < attrs.length; i++) {
    const name = attrs[i].name;
    const value = attrs[i].value;

    if (name.indexOf(PROP_MARK) === 0) {
      result[+name.split(ATTR_NUM_SEPARATOR)[1]] = {
        type: PROP_PART,
        name: value,
      };

      node.removeAttribute(name);
      i--;
    } else if (value.indexOf(ATTR_MARK) === 0) {
      result[+value.split(ATTR_NUM_SEPARATOR)[1]] = {
        type: ATTR_PART,
        name,
      };
    }
  }

  return result;
}

export interface TemplatePart {
  name?: string;
  type: number;
  position: number[];
}

export function getTemplatePartsFromElement(
  node: HTMLElement,
  position: number[]
): TemplatePart[] {
  const parts: TemplatePart[] = [];
  const attrs = getAttributes(node);

  for (let i = 0; i < attrs.length; i++) {
    let part: TemplatePart = {
      ...attrs[i],
      position: position.slice(),
    };

    const name = part.name!;

    if (part.type === ATTR_PART && name === REF_ATTR_NAME) {
      part.type = REF_PART;
    }

    parts.push(part);
  }

  node.removeAttribute(ATTR_MARK);

  return parts;
}
