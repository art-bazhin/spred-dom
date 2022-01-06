const RANDOM = 's-' + Math.random().toString(36).substring(2, 6);

export const PLACEHOLDER_MARK = RANDOM + '-ph';
export const ATTR_MARK = RANDOM + '-attr';
export const ATTR_NUM_SEPARATOR = '_';
export const PROP_MARK = RANDOM + '-prop';
export const PLACEHOLDER_COMMENT = '<!--' + PLACEHOLDER_MARK + '-->';

export const NODE_PART = 1;
export const ATTR_PART = 2;
export const EVENT_PART = 3;
export const PROP_PART = 4;
export const REF_PART = 5;

export const REF_ATTR_NAME = 'ref';

export const TEXT_CHILD = 1;
export const COMMENT_CHILD = 2;
export const ELEMENT_CHILD = 3;
