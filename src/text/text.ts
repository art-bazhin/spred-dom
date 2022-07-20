import { prop } from '../prop/prop';

export function text(str: string | (() => string)) {
  prop('textContent', str);
}
