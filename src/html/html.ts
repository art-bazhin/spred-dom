import { prop } from '../prop/prop';

export function html(str: string | (() => string)) {
  prop('innerHTML', str);
}
